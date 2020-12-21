module.exports = {
	cacheDirectory: '<rootDir>/../.cache/jest',
	moduleNameMapper: {
		'^calypso/config$': '<rootDir>/server/config/index.js',
	},
	transform: {
		'\\.[jt]sx?$': 'babel-jest',
		'\\.(gif|jpg|jpeg|png|svg|scss|sass|css)$': require.resolve(
			'@automattic/calypso-build/jest/transform/asset.js'
		),
	},
	modulePaths: [ '<rootDir>/extensions' ],
	rootDir: '../../client',
	resolver: '<rootDir>../test/module-resolver.js',
	testEnvironment: 'node',
	transformIgnorePatterns: [
		'node_modules[\\/\\\\](?!flag-icon-css|simple-html-tokenizer|draft-js|social-logos|gridicons|calypso)',
	],
	testMatch: [ '<rootDir>/**/test/*.[jt]s?(x)', '!**/*.skip.[jt]s?(x)', '!**/.eslintrc.*' ],
	testPathIgnorePatterns: [ '<rootDir>/server/' ],
	testURL: 'https://example.com',
	setupFiles: [ 'regenerator-runtime/runtime' ], // some NPM-published packages depend on the global
	setupFilesAfterEnv: [ '<rootDir>/../test/client/setup-test-framework.js' ],
	verbose: false,
	globals: {
		google: {},
	},
};
