/**
 * External dependencies
 */
const babelJest = require( 'babel-jest' ).default;
const path = require( 'path' );

module.exports = babelJest.createTransformer( {
	presets: [
		[ path.join( __dirname, '..', '..', 'babel', 'default.js' ), { modules: 'commonjs' } ],
	],
	babelrc: false,
	configFile: false,
} );
