var settings = {
  mochaOpts: undefined, // --mocha_opts opts_file
  mochaTestFolders: undefined, // --mocha_tests location (or array in magellan.json)

  initialize: function (argv) {
    settings.mochaOpts = argv.mocha_opts;
    settings.mochaTestFolders = argv.mocha_tests;
  }
};

module.exports = settings;