module.exports = {
	collectCoverageFrom: [ 'server/**/*.[jt]s?(x)' ],
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
		'\\.[jt]sx?$': 'babel-jest',
		'\\.(gif|jpg|jpeg|png|svg|scss|sass|css)$': require.resolve(
			'@automattic/calypso-build/jest/transform/asset.js'
		),
	},
	transformIgnorePatterns: [
		'node_modules[\\/\\\\](?!redux-form|draft-js)(?!.*\\.(?:gif|jpg|jpeg|png|svg|scss|sass|css))',
	],
	testMatch: [ '<rootDir>/server/**/test/*.[jt]s?(x)', '!**/.eslintrc.*' ],
	timers: 'fake',
	setupFiles: [ 'regenerator-runtime/runtime' ], // some NPM-published packages depend on the global
	setupFilesAfterEnv: [ '<rootDir>/test/server/setup-test-framework.js' ],
	verbose: false,
};
