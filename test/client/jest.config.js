/** @format */

module.exports = {
	moduleNameMapper: {
		'^config$': '<rootDir>/server/config/index.js',
	},
	transform: {
		'^.+\\.jsx?$': 'babel-jest',
		'\\.(gif|jpg|jpeg|png|svg|scss|sass|css)$': '<rootDir>/test/test/helpers/assets/transform.js',
	},
	modulePaths: [ '<rootDir>/test/', '<rootDir>/client/', '<rootDir>/client/extensions/' ],
	rootDir: './../../',
	roots: [ '<rootDir>/client/' ],
	testEnvironment: 'node',
	transformIgnorePatterns: [
		'node_modules[\\/\\\\](?!flag-icon-css|redux-form|simple-html-tokenizer)',
	],
	testMatch: [ '<rootDir>/client/**/test/*.js?(x)' ],
	testURL: 'https://example.com',
	setupTestFrameworkScriptFile: '<rootDir>/test/client/setup-test-framework.js',
	verbose: false,
	globals: {
		google: {},
	},
};
