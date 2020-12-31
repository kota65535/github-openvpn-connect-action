const fs = require('fs')
const core = require('@actions/core')
const exec = require('./exec')
const Tail = require('tail').Tail

const run = () => {
  const configFile = core.getInput('config_file').trim()
  const username = core.getInput('username').trim()
  const password = core.getInput('password').trim()
  const clientKey = core.getInput('client_key').trim()
  const tlsAuthKey = core.getInput('tls_auth_key').trim()
  const dnsHelperScriptFile = core.getInput('dnshelper_script_file').trim()

  if (!fs.existsSync(configFile)) {
    throw new Error(`config file '${configFile}' not found`)
  }

  // 1. Configure client

  fs.appendFileSync(configFile, '\n# ----- modified by action -----\n')

  // username & password auth
  if (username && password) {
    fs.appendFileSync(configFile, 'auth-user-pass up.txt\n')
    fs.writeFileSync('up.txt', [username, password].join('\n'))
  }

  // client certificate auth
  if (clientKey) {
    fs.appendFileSync(configFile, 'key client.key\n')
    fs.appendFileSync(configFile, 'tls-auth ta.key 1\n')
    fs.writeFileSync('client.key', clientKey)
    fs.writeFileSync('ta.key', tlsAuthKey)
  }

  // client dsn Script Path
  if (dnsHelperScriptFile.length > 0) {
    if (!fs.existsSync(dnsHelperScriptFile)) {
      throw new Error(`dns helper script file '${dnsHelperScriptFile}' not found`)
    }
    const githubWorkspacePath = process.env.GITHUB_WORKSPACE

    fs.appendFileSync(configFile, 'script-security 2\n')
    fs.appendFileSync(configFile, `up ${githubWorkspacePath}/${dnsHelperScriptFile}\n`)
    fs.appendFileSync(configFile, `down ${githubWorkspacePath}/${dnsHelperScriptFile}\n`)
    fs.appendFileSync(configFile, 'down-pre\n')
  }

  core.info('========== begin configuration ==========')
  core.info(fs.readFileSync(configFile, 'utf8'))
  core.info('=========== end configuration ===========')

  // 2. Run openvpn

  // prepare log file
  fs.writeFileSync('openvpn.log', '')
  const tail = new Tail('openvpn.log')

  try {
    exec(`sudo openvpn --config ${configFile} --daemon --log openvpn.log`)
  } catch (error) {
    core.error(fs.readFileSync('openvpn.log', 'utf8'))
    tail.unwatch()
    throw error
  }

  tail.on('line', (data) => {
    core.info(data)
    if (data.includes('Initialization Sequence Completed')) {
      core.info('VPN connected successfully.')
      tail.unwatch()
      clearTimeout(timer)
    }
  })

  const timer = setTimeout(() => {
    core.setFailed('VPN connection failed.')
    tail.unwatch()
  }, 15000)
}

module.exports = run
