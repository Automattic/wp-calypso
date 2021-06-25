const settings = {
	mochaConfig: undefined, // --mocha_config config file
	mochaArgs: undefined, // --mocha_args command line arguments
	mochaTestFolders: undefined, // --mocha_tests location (or array in magellan.json)
	suiteTag: undefined,

	initialize: function ( argv ) {
		settings.mochaConfig = argv.mocha_config;
		settings.mochaArgs = argv.mocha_args;
		settings.mochaTestFolders = argv.mocha_tests;
		settings.suiteTag = argv.suiteTag;
	},
};

module.exports = settings;
