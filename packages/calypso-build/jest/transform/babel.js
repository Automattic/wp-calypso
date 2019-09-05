/**
 * External dependencies
 */
const babelJest = require( 'babel-jest' );
const path = require( 'path' );

module.exports = babelJest.createTransformer( {
	presets: [ path.join( __dirname, '..', '..', 'babel', 'default.js' ) ],
	babelrc: false,
	configFile: false,
} );
