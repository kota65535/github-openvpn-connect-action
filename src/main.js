const fs = require("fs");
const core = require("@actions/core");
const exec = require("./exec");
const Tail = require("tail").Tail;

const run = (callback) => {
  const configFile = core.getInput("config_file", { required: true });
  const username = core.getInput("username");
  const password = core.getInput("password");
  const clientKey = core.getInput("client_key");
  const tlsAuthKey = core.getInput("tls_auth_key");
  const tlsCryptKey = core.getInput("tls_crypt_key");
  const tlsCryptV2Key = core.getInput("tls_crypt_v2_key");
  const echoConfig = core.getInput("echo_config");
  const clientVersion = core.getInput("client_version") || "v2"; // uses v2 by default

  if (!fs.existsSync(configFile)) {
    throw new Error(`config file '${configFile}' not found`);
  }

  // 1. Configure client
  fs.appendFileSync(configFile, "\n# ----- modified by action -----\n");

  if (username && password) {
    fs.appendFileSync(configFile, "auth-user-pass up.txt\n");
    fs.writeFileSync("up.txt", [username, password].join("\n"), { mode: 0o600 });
  }

  if (clientKey) {
    fs.appendFileSync(configFile, "key client.key\n");
    fs.writeFileSync("client.key", clientKey, { mode: 0o600 });
  }

  if (tlsAuthKey) {
    fs.appendFileSync(configFile, "tls-auth ta.key 1\n");
    fs.writeFileSync("ta.key", tlsAuthKey, { mode: 0o600 });
  }

  if (tlsCryptKey) {
    fs.appendFileSync(configFile, "tls-crypt tc.key 1\n");
    fs.writeFileSync("tc.key", tlsCryptKey, { mode: 0o600 });
  }

  if (tlsCryptV2Key) {
    fs.appendFileSync(configFile, "tls-crypt-v2 tcv2.key 1\n");
    fs.writeFileSync("tcv2.key", tlsCryptV2Key, { mode: 0o600 });
  }

  if (echoConfig === "true") {
    core.info("========== begin configuration ==========");
    core.info(fs.readFileSync(configFile, "utf8"));
    core.info("=========== end configuration ===========");
  }

  // 2. Run openvpn
  if (clientVersion === "v3") {
  core.info("Using OpenVPN v3 client...");

  try {
    // Start session
    exec(`sudo openvpn3 session-start --config ${configFile}`);
  } catch (error) {
    core.setFailed("VPN connection failed (OpenVPN v3).");
    throw error;
  }

  // Poll session-list to confirm connection
  const { execSync } = require("child_process");
  const maxAttempts = 15; // up to ~15s
  let connected = false;

  for (let i = 0; i < maxAttempts; i++) {
    const out = execSync("openvpn3 sessions-list", { encoding: "utf8" });
    if (out.includes(configFile)) {
      core.info("VPN connected successfully (OpenVPN v3).");
      connected = true;
      callback("openvpn3");
      break;
    }
    core.info("Waiting for VPN session to appear...");
    require("child_process").execSync("sleep 1");
  }

  if (!connected) {
    core.setFailed("VPN connection failed (timeout, v3).");
  }
  
  } else {
    core.info("Using OpenVPN v2 client...");

    fs.writeFileSync("openvpn.log", "");
    const tail = new Tail("openvpn.log");

    try {
      exec(`sudo openvpn2 --config ${configFile} --daemon --log openvpn.log --writepid openvpn.pid`);
    } catch (error) {
      core.error(fs.readFileSync("openvpn.log", "utf8"));
      tail.unwatch();
      throw error;
    }

    tail.on("line", (data) => {
      core.info(data);
      if (data.includes("Initialization Sequence Completed")) {
        tail.unwatch();
        clearTimeout(timer);
        const pid = fs.readFileSync("openvpn.pid", "utf8").trim();
        core.info(`VPN connected successfully. Daemon PID: ${pid}`);
        callback(pid);
      }
    });

    const timer = setTimeout(() => {
      core.setFailed("VPN connection failed.");
      tail.unwatch();
    }, 15000);
  }
};

module.exports = run;
