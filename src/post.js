const core = require('@actions/core')
const exec = require('./exec')

const run = () => {
  try {
    exec('sudo killall openvpn')
  } catch (error) {
    core.warning(error.message)
  }
}

module.exports = run
