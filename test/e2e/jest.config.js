module.exports = {
	bail: true,
	cacheDirectory: '<rootDir>/../../.cache/jest',
	testEnvironment: 'node',
	testMatch: [ '<rootDir>/specs/**/*.js' ],
	setupFilesAfterEnv: [ '<rootDir>/jest.setup.js', '<rootDir>/lib/hooks/jest.js' ],
	verbose: true,
	transform: {
		'\\.[jt]sx?$': [ 'babel-jest', { configFile: '../../babel.config.js' } ],
	},
};
