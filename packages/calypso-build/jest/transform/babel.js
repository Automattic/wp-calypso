const path = require( 'path' );
const babelJest = require( 'babel-jest' ).default;

module.exports = babelJest.createTransformer( {
	presets: [
		[ path.join( __dirname, '..', '..', 'babel', 'default.js' ), { modules: 'commonjs' } ],
	],
	babelrc: false,
	configFile: false,
} );
