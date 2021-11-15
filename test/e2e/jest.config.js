module.exports = {
	cacheDirectory: '<rootDir>/../../.cache/jest',
	testMatch: [ '<rootDir>/specs/**/*.[jt]s' ],
	setupFilesAfterEnv: [ '<rootDir>/lib/jest/setup.js' ],
	globalSetup: '<rootDir>/lib/jest/globalSetup.ts',
	globalTeardown: '<rootDir>/lib/jest/globalTeardown.ts',
	verbose: true,
	transform: {
		'\\.[jt]sx?$': [ 'babel-jest', { configFile: '../../babel.config.js' } ],
	},
	runner: 'groups', // This is for jest-runner-groups. It works with jest-circus below!
	testRunner: 'jest-circus/runner',
	testEnvironment: '<rootDir>/lib/jest/environment.js',
};
