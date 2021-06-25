const core = require('@actions/core')
const exec = require('./exec')

const run = (pid) => {
  if (!pid) {
    return
  }
  try {
    exec(`sudo kill ${pid}`)
  } catch (error) {
    core.warning(error.message)
  }
}

module.exports = run
