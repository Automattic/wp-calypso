const { defaults } = require( 'jest-config' );

/**
 * We need to use require.resolve() for all relative paths. Otherwise they get resolved relative to
 * <rootDir>, which by default is the dirname of the file importing this preset.
 */

module.exports = {
	resolver: require.resolve( './src/module-resolver.js' ),
	setupFilesAfterEnv: [ require.resolve( './src/setup.js' ) ],
	testEnvironment: 'node',
	testMatch: [ '<rootDir>/**/test/*.[jt]s?(x)', '!**/.eslintrc.*' ],
	transform: {
		'\\.[jt]sx?$': [ 'babel-jest', { rootMode: 'upward' } ],
		'\\.(gif|jpg|jpeg|png|svg|scss|sass|css)$': require.resolve( './src/asset-transform.js' ),
	},
	testPathIgnorePatterns: [ ...defaults.testPathIgnorePatterns, '/dist/' ],
	verbose: false,
	snapshotFormat: {
		escapeString: true,
		printBasicPrototype: true,
	},
};
