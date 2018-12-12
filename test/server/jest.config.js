/** @format */

module.exports = {
	collectCoverageFrom: [ 'server/**/*.js?(x)' ],
	coveragePathIgnorePatterns: [ '<rootDir>/server/devdocs/search-index.js' ],
	modulePaths: [
		'<rootDir>/test/',
		'<rootDir>/server/',
		'<rootDir>/client/',
		'<rootDir>/client/extensions/',
	],
	rootDir: './../../',
	roots: [ '<rootDir>/server/' ],
	testEnvironment: 'node',
	transform: {
		'^.+\\.jsx?$': 'babel-jest',
		'\\.(gif|jpg|jpeg|png|svg|scss|sass|css)$': '<rootDir>/test/test/helpers/assets/transform.js',
	},
	transformIgnorePatterns: [ 'node_modules[\\/\\\\](?!redux-form|draft-js)' ],
	testMatch: [ '<rootDir>/server/**/test/*.js?(x)', '!**/.eslintrc.*' ],
	timers: 'fake',
	setupFiles: [ 'regenerator-runtime/runtime' ], // some NPM-published packages depend on the global
	setupFilesAfterEnv: [ '<rootDir>/test/server/setup-test-framework.js' ],
	verbose: false,
};
