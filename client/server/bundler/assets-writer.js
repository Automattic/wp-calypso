/**
 * External Dependencies
 */
const fs = require( 'fs' ); // eslint-disable-line  import/no-nodejs-modules
const path = require( 'path' );
const _ = require( 'lodash' );

function AssetsWriter( options ) {
	this.options = Object.assign(
		{
			path: './build',
			filename: 'assets.json',
		},
		options
	);
}

Object.assign( AssetsWriter.prototype, {
	createOutputStream: function () {
		this.outputPath = path.join( this.options.path, this.options.filename );
		this.outputStream = fs.createWriteStream( this.outputPath );
	},
	apply: function ( compiler ) {
		const self = this;

		compiler.hooks.afterEmit.tapAsync( 'AssetsWriter', ( compilation, callback ) => {
			this.createOutputStream();
			const stats = compilation.getStats().toJson( {
				hash: true,
				publicPath: true,
				assets: true,
				children: false,
				chunks: true,
				chunkModules: false,
				chunkOrigins: false,
				entrypoints: true,
				modules: false,
				source: false,
				errorDetails: true,
				timings: false,
				reasons: false,
			} );

			const statsToOutput = {};
			statsToOutput.publicPath = stats.publicPath;
			statsToOutput.manifests = {};

			for ( const name in stats.assetsByChunkName ) {
				// make the manifest inlineable
				if ( String( name ).startsWith( 'manifest' ) ) {
					// Usually there's only one asset per chunk, but when we build with sourcemaps, we'll have two.
					// Remove the sourcemap from the list and just take the js asset
					// This may not hold true for all chunks, but it does for the manifest.
					const jsAsset = _.head(
						_.reject( _.castArray( stats.assetsByChunkName[ name ] ), ( asset ) =>
							_.endsWith( asset, '.map' )
						)
					);
					statsToOutput.manifests[ name ] = compilation.assets[ jsAsset ].source();
				}
			}

			function fixupPath( f ) {
				return path.join( stats.publicPath, f );
			}

			statsToOutput.entrypoints = _.mapValues( stats.entrypoints, ( entry ) => ( {
				chunks: _.reject( entry.chunks, ( chunk ) => {
					String( chunk ).startsWith( 'manifest' );
				} ),
				assets: _.reject( entry.assets, ( asset ) => asset.startsWith( 'manifest' ) ).map(
					fixupPath
				),
			} ) );

			statsToOutput.assetsByChunkName = _.mapValues( stats.assetsByChunkName, ( asset ) =>
				_.castArray( asset ).map( fixupPath )
			);

			statsToOutput.chunks = stats.chunks.map( ( chunk ) =>
				Object.assign( {}, chunk, {
					files: chunk.files.map( fixupPath ),
					siblings: _.reject( chunk.siblings, ( sibling ) =>
						String( sibling ).startsWith( 'manifest' )
					),
				} )
			);

			self.outputStream.end( JSON.stringify( statsToOutput, null, '\t' ), callback );
		} );
	},
} );

module.exports = AssetsWriter;
