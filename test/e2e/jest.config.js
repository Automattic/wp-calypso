module.exports = {
	globals: {
		'ts-jest': {
			babelConfig: '../../babel.config.js',
			tsConfig: './tsconfig.json',
		},
	},
	cacheDirectory: '<rootDir>/../../.cache/jest',
	testMatch: [ '<rootDir>/specs/**/*.[jt]s' ],
	setupFilesAfterEnv: [ '<rootDir>/lib/jest/setup.js' ],
	verbose: true,
	transform: {
		'\\.jsx?$': [ 'babel-jest', { configFile: '../../babel.config.js' } ],
		'\\.tsx?$': 'ts-jest',
	},
	testRunner: 'jest-circus/runner',
	testEnvironment: '<rootDir>/lib/jest/environment.js',
};
