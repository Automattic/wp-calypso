/**
 * External dependencies
 */
const path = require( 'path' );

/**
 * Internal dependencies
 */
const {
	hasProjectFile,
	hasPackageProp,
} = require( '../utils' );

const jestConfig = {
	preset: '@wordpress/jest-preset-default',
};

const hasBabelConfig = hasProjectFile( '.babelrc' ) ||
	hasProjectFile( 'babel.config.js' ) ||
	hasPackageProp( 'babel' );

if ( ! hasBabelConfig ) {
	jestConfig.transform = {
		'^.+\\.jsx?$': path.join( __dirname, 'babel-transform' ),
	};
}

module.exports = jestConfig;
