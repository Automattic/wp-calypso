/**
 * External dependencies
 */
const path = require( 'path' );

module.exports = {
	setupFilesAfterEnv: [ path.join( __dirname, 'jest', 'setup.js' ) ],
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
	verbose: false,
};
