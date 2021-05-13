/**
 * External dependencies
 */
const path = require( 'path' );
const { defaults } = require( 'jest-config' );

module.exports = {
	setupFilesAfterEnv: [
		path.join( __dirname, 'jest', 'setup.js' ),
		require.resolve( 'jest-enzyme' ),
	],
	snapshotSerializers: [ 'enzyme-to-json/serializer' ],
	testEnvironment: 'node',
	testMatch: [ '<rootDir>/**/test/*.[jt]s?(x)', '!**/.eslintrc.*' ],
	transform: {
		'\\.[jt]sx?$': path.join( __dirname, 'jest', 'transform', 'babel.js' ),
		'\\.(gif|jpg|jpeg|png|svg|scss|sass|css)$': path.join(
			__dirname,
			'jest',
			'transform',
			'asset.js'
		),
	},
	testPathIgnorePatterns: [ ...defaults.testPathIgnorePatterns, '/dist/' ],
	verbose: false,
};
