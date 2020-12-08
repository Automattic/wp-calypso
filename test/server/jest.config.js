module.exports = {
	cacheDirectory: '<rootDir>/../.cache/jest',
	modulePaths: [ '<rootDir>/../test', '<rootDir>/server', '<rootDir>', '<rootDir>/extensions' ],
	rootDir: '../../client',
	roots: [ '<rootDir>/server' ],
	testEnvironment: 'node',
	resolver: '<rootDir>/../test/module-resolver.js',
	transform: {
		'\\.[jt]sx?$': 'babel-jest',
		'\\.(gif|jpg|jpeg|png|svg|scss|sass|css)$': require.resolve(
			'@automattic/calypso-build/jest/transform/asset.js'
		),
	},
	transformIgnorePatterns: [
		'node_modules[\\/\\\\](?!draft-js|calypso)(?!.*\\.(?:gif|jpg|jpeg|png|svg|scss|sass|css))',
	],
	moduleNameMapper: {
		'^calypso/config$': 'calypso/server/config',
		'^calypso/config/(.*)$': 'calypso/server/config/$1',
	},
	testMatch: [ '<rootDir>/server/**/test/*.[jt]s?(x)', '!**/.eslintrc.*' ],
	timers: 'fake',
	setupFiles: [ 'regenerator-runtime/runtime' ], // some NPM-published packages depend on the global
	setupFilesAfterEnv: [ '<rootDir>/../test/server/setup-test-framework.js' ],
	verbose: false,
};
