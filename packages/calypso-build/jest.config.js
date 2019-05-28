/**
 * External dependencies
 */
const path = require( 'path' );

module.exports = {
	setupFilesAfterEnv: [ path.join( __dirname, 'jest', 'setup.js' ) ],
	testEnvironment: 'node',
	testMatch: [ '<rootDir>/**/test/*.js?(x)', '!**/.eslintrc.*' ],
	transform: {
		'^.+\\.[jt]sx?$': 'babel-jest',
		'\\.(gif|jpg|jpeg|png|svg|scss|sass|css)$': path.join(
			__dirname,
			'jest',
			'util',
			'assets',
			'transform.js'
		),
	},
	verbose: false,
};
