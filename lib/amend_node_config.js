var _ = require("lodash");

module.exports = function (env, nodeConfigAdditions) {
  var nodeConfig = env.NODE_CONFIG;

  if (typeof nodeConfig === "string") {
    try {
      nodeConfig = JSON.parse(nodeConfig);
    } catch (e) {
      // bad node config. Just start a new one
      nodeConfig = {};
    }
  }

  if (nodeConfig && typeof nodeConfig === "object") {
    // already an object {}
  } else {
    nodeConfig = {};
  }

  return _.extend(nodeConfig, nodeConfigAdditions);
};