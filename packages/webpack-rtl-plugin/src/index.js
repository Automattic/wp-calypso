const path = require( 'path' );
const rtlcss = require( 'rtlcss' );
const cssDiff = require( '@romainberger/css-diff' );
const { ConcatSource } = require( 'webpack' ).sources;

const pluginName = 'WebpackRTLPlugin';

class WebpackRTLPlugin {
	constructor( options ) {
		this.options = {
			options: {},
			plugins: [],
			...options,
		};
	}

	apply( compiler ) {
		compiler.hooks.thisCompilation.tap( pluginName, ( compilation ) => {
			compilation.hooks.processAssets.tapPromise(
				{ name: pluginName, stage: compilation.PROCESS_ASSETS_STAGE_DERIVED },
				async ( assets ) =>
					Promise.all(
						Object.keys( assets )
							.filter( ( asset ) => path.extname( asset ) === '.css' )
							.map( async ( asset ) => {
								const match = this.options.test
									? new RegExp( this.options.test ).test( asset )
									: true;

								if ( ! match ) return;

								// Extract RTL
								const baseSource = assets[ asset ].source();
								let rtlSource = rtlcss.process(
									baseSource,
									this.options.options,
									this.options.plugins
								);
								if ( this.options.diffOnly ) {
									rtlSource = cssDiff( baseSource, rtlSource );
								}

								// Compute the filename
								const baseName = path.basename( asset, '.css' );
								const filename = asset.replace( baseName, `${ baseName }.rtl` );

								// Save the asset
								assets[ filename ] = new ConcatSource( rtlSource );
							} )
					)
			);
		} );
	}
}

module.exports = WebpackRTLPlugin;
