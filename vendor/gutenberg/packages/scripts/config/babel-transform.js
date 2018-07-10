/**
 * External dependencies
 */
const babelJest = require( 'babel-jest' );

module.exports = babelJest.createTransformer( {
	presets: [ '@wordpress/babel-preset-default' ],
} );
