const cssDiff = require( '@romainberger/css-diff' );
const rtlcss = require( 'rtlcss' );
const { ConcatSource } = require( 'webpack' ).sources;

const pluginName = 'WebpackRTLPlugin';

class WebpackRTLPlugin {
	constructor( options ) {
		this.options = {
			options: {},
			plugins: [],
			...options,
		};
		this.cache = new WeakMap();
	}

	apply( compiler ) {
		compiler.hooks.thisCompilation.tap( pluginName, ( compilation ) => {
			compilation.hooks.processAssets.tapPromise(
				{ name: pluginName, stage: compilation.PROCESS_ASSETS_STAGE_DERIVED },
				async ( assets ) => {
					const cssRe = /\.css(?:$|\?)/;
					return Promise.all(
						Array.from( compilation.chunks )
							.flatMap( ( chunk ) =>
								// Collect all files form all chunks, and generate an array of {chunk, file} objects
								Array.from( chunk.files ).map( ( asset ) => ( { chunk, asset } ) )
							)
							.filter( ( { asset } ) => cssRe.test( asset ) )
							.map( async ( { chunk, asset } ) => {
								if ( this.options.test ) {
									const re = new RegExp( this.options.test );
									if ( ! re.test( asset ) ) {
										return;
									}
								}

								// Compute the filename
								const filename = asset.replace( cssRe, '.rtl$&' );
								const assetInstance = assets[ asset ];
								chunk.files.add( filename );

								if ( this.cache.has( assetInstance ) ) {
									const cachedRTL = this.cache.get( assetInstance );
									assets[ filename ] = cachedRTL;
								} else {
									const baseSource = assetInstance.source();
									let rtlSource = rtlcss.process(
										baseSource,
										this.options.options,
										this.options.plugins
									);
									if ( this.options.diffOnly ) {
										rtlSource = cssDiff( baseSource, rtlSource );
									}
									// Save the asset
									assets[ filename ] = new ConcatSource( rtlSource );
									this.cache.set( assetInstance, assets[ filename ] );
								}
							} )
					);
				}
			);
		} );
	}
}

module.exports = WebpackRTLPlugin;
