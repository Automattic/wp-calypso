const babelJest = require( 'babel-jest' ).default;

module.exports = babelJest.createTransformer( {
	presets: [
		[
			require.resolve( '@automattic/calypso-babel-config/presets/default' ),
			{ modules: 'commonjs', runtime: 'automatic' },
		],
	],
	babelrc: false,
	configFile: false,
} );
