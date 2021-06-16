module.exports = {
	cacheDirectory: '<rootDir>/../../.cache/jest',
	testEnvironment: 'node',
	testMatch: [ '<rootDir>/specs/**/*.js' ],
	globalSetup: '<rootDir>/jest.global-setup.js',
	setupFilesAfterEnv: [ '<rootDir>/jest.setup.js', '<rootDir>/lib/hooks/jest.js' ],
	verbose: true,
	transform: {
		'\\.[jt]sx?$': [ 'babel-jest', { configFile: '../../babel.config.js' } ],
	},
};
