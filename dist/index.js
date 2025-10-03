/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 946:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const shelljsExec = __nccwpck_require__(705);
const core = __nccwpck_require__(194);

const exec = (cmd) => {
  core.info(`running command: ${cmd}`);
  const res = shelljsExec(cmd);
  if (res.code !== 0) {
    core.warning(res.stdout);
    throw new Error(`command: ${cmd} returned ${res.code}`);
  }
  core.info(res.stdout);
};

module.exports = exec;


/***/ }),

/***/ 246:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const fs = __nccwpck_require__(896);
const core = __nccwpck_require__(194);
const exec = __nccwpck_require__(946);
const Tail = (__nccwpck_require__(571).Tail);

const run = (callback) => {
  const configFile = core.getInput("config_file", { required: true });
  const username = core.getInput("username");
  const password = core.getInput("password");
  const clientKey = core.getInput("client_key");
  const tlsAuthKey = core.getInput("tls_auth_key");
  const tlsCryptKey = core.getInput("tls_crypt_key");
  const tlsCryptV2Key = core.getInput("tls_crypt_v2_key");
  const echoConfig = core.getInput("echo_config");
  const clientVersion = core.getInput("client_version") || "v2"; // default to v2

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
  const { execSync } = __nccwpck_require__(317);
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
    (__nccwpck_require__(317).execSync)("sleep 1");
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


/***/ }),

/***/ 194:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 705:
/***/ ((module) => {

module.exports = eval("require")("shelljs.exec");


/***/ }),

/***/ 571:
/***/ ((module) => {

module.exports = eval("require")("tail");


/***/ }),

/***/ 317:
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

/***/ }),

/***/ 896:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __nccwpck_require__(246);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;