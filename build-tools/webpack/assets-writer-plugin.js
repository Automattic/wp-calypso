const fs = require( 'fs' );
const path = require( 'path' );
const _ = require( 'lodash' );
const mkdirp = require( 'mkdirp' );

function AssetsWriter( options ) {
	this.options = Object.assign(
		{
			path: './build',
			filename: 'assets.json',
			runtimeChunk: 'runtime',
			manifestFile: 'manifest',
			runtimeFile: 'runtime',
		},
		options
	);
}

Object.assign( AssetsWriter.prototype, {
	createOutputStream: function () {
		this.outputPath = path.join( this.options.path, this.options.filename );
		mkdirp.sync( this.options.path );
		this.outputStream = fs.createWriteStream( this.outputPath );
	},
	apply: function ( compiler ) {
		const self = this;

		compiler.hooks.emit.tapAsync( 'AssetsWriter', ( compilation, callback ) => {
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
				if ( String( name ).startsWith( this.options.runtimeChunk ) ) {
					// Runtime chunk will have two files due ExtractManifestPlugin. Both need to be inlined.
					// When we build with sourcemaps, we'll have another two extra files.
					// Remove the sourcemap from the list and just take the js assets.
					statsToOutput.manifests = stats.assetsByChunkName[ name ]
						.filter( ( asset ) => ! asset.endsWith( '.map' ) )
						.map( ( asset ) => compilation.assets[ asset ].source() );
				}
			}

			function fixupPath( f ) {
				return path.join( stats.publicPath, f );
			}

			statsToOutput.assets = _.mapValues( stats.namedChunkGroups, ( { assets } ) =>
				_.reject(
					assets,
					( { name } ) =>
						name.startsWith( this.options.manifestFile ) ||
						name.startsWith( this.options.runtimeFile )
				).map( ( { name } ) => fixupPath( name ) )
			);

			self.outputStream.end( JSON.stringify( statsToOutput, null, '\t' ), callback );
		} );
	},
} );

module.exports = AssetsWriter;
