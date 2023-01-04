const core = require("@actions/core");
const main = require("./main");
const post = require("./post");

const isPost = core.getState("isPost");

if (isPost) {
  // cleanup
  const pid = core.getState("pid");
  try {
    post(pid);
  } catch (error) {
    core.setFailed(error.message);
  }
} else {
  // main
  try {
    main((pid) => core.saveState("pid", pid));
  } catch (error) {
    core.setFailed(error.message);
  } finally {
    // cf. https://github.com/actions/checkout/blob/main/src/state-helper.ts
    core.saveState("isPost", "true");
  }
}
