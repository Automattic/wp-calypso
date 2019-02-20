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
		'node_modules[\\/\\\\](?!flag-icon-css|redux-form|simple-html-tokenizer|draft-js)',
	],
	testMatch: [ '<rootDir>/client/**/test/*.js?(x)', '!**/.eslintrc.*' ],
	testURL: 'https://example.com',
	setupFiles: [ 'regenerator-runtime/runtime' ], // some NPM-published packages depend on the global
	setupFilesAfterEnv: [ '<rootDir>/test/client/setup-test-framework.js' ],
	verbose: false,
	globals: {
		google: {},
	},
};
