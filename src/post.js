const core = require('@actions/core')
const exec = require('./exec')

const run = (pid) => {
  if (!pid) {
    return
  }
  try {
    // suppress warning even if the process already killed
    exec(`sudo kill ${pid} || true`)
  } catch (error) {
    core.warning(error.message)
  }
}

module.exports = run
