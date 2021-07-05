module.exports = {
	cacheDirectory: '<rootDir>/../../.cache/jest',
	testMatch: [ '<rootDir>/specs/**/*.js' ],
	globalSetup: '<rootDir>/lib/jest/jest.global-setup.js',
	setupFilesAfterEnv: [ '<rootDir>/lib/jest/jest.setup.js', '<rootDir>/lib/hooks/jest.js' ],
	verbose: true,
	transform: {
		'\\.[jt]sx?$': [ 'babel-jest', { configFile: '../../babel.config.js' } ],
	},
	testRunner: 'jest-circus/runner',
	testEnvironment: '<rootDir>/lib/jest/jest-environment-e2e.js',
};
