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
				async ( assets ) => {
					return Promise.all(
						Array.from( compilation.chunks )
							.flatMap( ( chunk ) =>
								// Collect all files form all chunks, and generate an array of {chunk, file} objects
								Array.from( chunk.files ).map( ( asset ) => ( { chunk, asset } ) )
							)
							.filter( ( { asset } ) => path.extname( asset ) === '.css' )
							.map( async ( { chunk, asset } ) => {
								if ( this.options.test ) {
									const re = new RegExp( this.options.test );
									if ( ! re.test( asset ) ) {
										return;
									}
								}

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
								chunk.files.add( filename );
							} )
					);
				}
			);
		} );
	}
}

module.exports = WebpackRTLPlugin;
