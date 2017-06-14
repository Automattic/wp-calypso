module.exports = {
	collectCoverageFrom: [ '**/server/**/*.js?(x)', '!**/jest.config.*' ],
	modulePaths: [
		'<rootDir>/test/',
		'<rootDir>/server/',
		'<rootDir>/client/',
		'<rootDir>/client/extensions/',
	],
	rootDir: './../',
	testEnvironment: 'node',
	testMatch: [ '**/server/**/test/*.js?(x)' ],
	timers: 'fake',
	setupTestFrameworkScriptFile: '<rootDir>/test/jest/setup-test-framework.js',
	verbose: true,
};
