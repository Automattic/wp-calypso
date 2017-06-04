module.exports = {
	modulePaths: [
		'<rootDir>/test/',
		'<rootDir>/client/',
	],
	rootDir: './../',
	testEnvironment: 'node',
	testMatch: [ '**/client/**/test/*.js?(x)' ],
	timers: 'fake',
	setupTestFrameworkScriptFile: '<rootDir>/test/setup-test-framework.js',
	verbose: false,
};
