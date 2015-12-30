var settings = {
  mochaOpts: argv.mocha_opts, // --mocha_opts opts_file
  mochaTestFolders: argv.mocha_tests, // --mocha_tests location (or array in magellan.json)

  initialize: function (argv) {
    settings.mochaOpts = argv.mocha_opts;
    settings.mochaTestFolders = argv.mocha_tests;
  }
};

module.exports = settings;