var plugin = {
  initialize: function (argv) {
    plugin.settings.initialize(argv);
  },
  iterator: require("./lib/get_tests"),
  filters: {
    tag: require("./lib/tag_filter")
  },
  settings: require("./lib/settings"),
  TestRun: require("./lib/test_run")
};

module.exports = plugin;