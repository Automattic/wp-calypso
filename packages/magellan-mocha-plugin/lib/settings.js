'use strict';

var settings = {
	mochaOpts: undefined, // --mocha_opts opts_file
	mochaArgs: undefined, // --mocha_args command line arguments
	mochaTestFolders: undefined, // --mocha_tests location (or array in magellan.json)
	suiteTag: undefined,

	initialize: function ( argv ) {
		settings.mochaOpts = argv.mocha_opts;
		settings.mochaArgs = argv.mocha_args;
		settings.mochaTestFolders = argv.mocha_tests;
		settings.suiteTag = argv.suiteTag;
	},
};

module.exports = settings;
