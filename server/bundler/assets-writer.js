/** @format */
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
	this.createOutputStream();
}

Object.assign( AssetsWriter.prototype, {
	createOutputStream: function() {
		this.outputPath = path.join( this.options.path, this.options.filename );
		this.outputStream = fs.createWriteStream( this.outputPath );
	},
	apply: function( compiler ) {
		const self = this;

		compiler.hooks.afterEmit.tap( 'AssetsWriter', compilation => {
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
					statsToOutput.manifests[ name ] = compilation.assets[
						stats.assetsByChunkName[ name ]
					].source();
				}
			}

			function fixupPath( f ) {
				return path.join( stats.publicPath, f );
			}

			statsToOutput.entrypoints = _.mapValues( stats.entrypoints, entry => ( {
				chunks: _.reject( entry.chunks, chunk => chunk.startsWith( 'manifest' ) ),
				assets: _.reject( entry.assets, asset => asset.startsWith( 'manifest' ) ).map( fixupPath ),
			} ) );

			statsToOutput.assetsByChunkName = _.mapValues( stats.assetsByChunkName, asset =>
				_.castArray( asset ).map( fixupPath )
			);

			statsToOutput.chunks = stats.chunks.map( chunk =>
				Object.assign( {}, chunk, {
					files: chunk.files.map( fixupPath ),
					siblings: _.reject( chunk.siblings, sibling => sibling.startsWith( 'manifest' ) ),
				} )
			);

			self.outputStream.write( JSON.stringify( statsToOutput, null, '\t' ) );
		} );
	},
} );

module.exports = AssetsWriter;
