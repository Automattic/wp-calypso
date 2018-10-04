/** @format */

module.exports = {
	moduleNameMapper: {
		'^config$': '<rootDir>/server/config/index.js',
	},
	transform: {
		'^.+\\.jsx?$': 'babel-jest',
		'\\.(svg|(sc|sa|c)ss)$': '<rootDir>/test/test/helpers/assets/transform.js',
	},
	modulePaths: [ '<rootDir>/test/', '<rootDir>/client/', '<rootDir>/client/extensions/' ],
	rootDir: './../../',
	roots: [ '<rootDir>/client/', '<rootDir>/packages/' ],
	testEnvironment: 'node',
	transformIgnorePatterns: [ 'node_modules[\\/\\\\](?!flag-icon-css|redux-form)' ],
	testMatch: [ '<rootDir>/client/**/test/*.js?(x)', '<rootDir>/packages/**/test/*.js?(x)' ],
	testURL: 'https://example.com',
	setupTestFrameworkScriptFile: '<rootDir>/test/client/setup-test-framework.js',
	verbose: false,
	globals: {
		google: {},
	},
};
