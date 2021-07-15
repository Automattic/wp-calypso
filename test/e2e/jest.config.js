module.exports = {
	cacheDirectory: '<rootDir>/../../.cache/jest',
	testMatch: [ '<rootDir>/specs/**/*.js' ],
	setupFilesAfterEnv: [ '<rootDir>/lib/jest/setup.js' ],
	verbose: true,
	transform: {
		'\\.[jt]sx?$': [ 'babel-jest', { configFile: '../../babel.config.js' } ],
	},
	testRunner: 'jest-circus/runner',
	testEnvironment: '<rootDir>/lib/jest/environment.js',
};
