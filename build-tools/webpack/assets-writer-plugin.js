const fs = require( 'fs' );
const path = require( 'path' );
const _ = require( 'lodash' );

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
		fs.mkdirSync( this.options.path, { recursive: true } );
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

			function fixupPath( f ) {
				return path.join( stats.publicPath, f );
			}

			// Exclude hot update files (info.hotModuleReplacement) and source maps (info.development)
			function isDevelopmentAsset( name ) {
				const asset = stats.assets.find( ( a ) => a.name === name );
				if ( ! asset ) {
					return false;
				}

				return asset.info.hotModuleReplacement || asset.info.development;
			}

			const statsToOutput = {};

			statsToOutput.manifests = {};
			for ( const name in stats.assetsByChunkName ) {
				// make the manifest inlineable
				if ( String( name ).startsWith( this.options.runtimeChunk ) ) {
					// Runtime chunk will have two files due to ExtractManifestPlugin. Both need to be inlined.
					statsToOutput.manifests = stats.assetsByChunkName[ name ]
						.filter( ( asset ) => ! isDevelopmentAsset( asset ) ) // exclude hot updates and sourcemaps
						.map( ( asset ) => compilation.assets[ asset ].source() );
				}
			}

			statsToOutput.assets = _.mapValues( stats.namedChunkGroups, ( { assets } ) =>
				_.reject(
					assets,
					( { name } ) =>
						isDevelopmentAsset( name ) ||
						name.startsWith( this.options.manifestFile ) ||
						name.startsWith( this.options.runtimeFile )
				).map( ( { name } ) => fixupPath( name ) )
			);

			self.outputStream.end( JSON.stringify( statsToOutput, null, '\t' ), callback );
		} );
	},
} );

module.exports = AssetsWriter;
