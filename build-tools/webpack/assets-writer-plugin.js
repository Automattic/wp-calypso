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
				chunkGroups: true,
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

			// Exclude hot update files (info.hotModuleReplacement) and source maps.
			// `asset.info.development` is false when using hidden-source-map,
			// so we also explicitly filter out any `.map` assets by filename.
			function isDevelopmentAsset( name ) {
				// Treat all source map files as development-only so they are never inlined into HTML.
				if ( name.endsWith( '.map' ) ) {
					return true;
				}

				const asset = stats.assets.find( ( a ) => a.name === name );
				if ( ! asset ) {
					return false;
				}

				return asset.info.hotModuleReplacement || asset.info.development;
			}

			function getAssetName( asset ) {
				return typeof asset === 'string' ? asset : asset.name;
			}

			const statsToOutput = {};

			statsToOutput.manifests = {};
			for ( const name in stats.assetsByChunkName ) {
				// make the manifest inlineable
				if ( String( name ).startsWith( this.options.runtimeChunk ) ) {
					// Runtime chunk will have two files due to ExtractManifestPlugin. Both need to be inlined.
					statsToOutput.manifests = stats.assetsByChunkName[ name ]
						.map( getAssetName )
						.filter( ( asset ) => ! isDevelopmentAsset( asset ) ) // exclude hot updates and sourcemaps
						.map( ( asset ) => compilation.assets[ asset ].source() );
				}
			}

			const chunkGroups = stats.namedChunkGroups || stats.entrypoints || {};
			statsToOutput.assets = _.mapValues( chunkGroups, ( { assets } ) =>
				_.reject( assets, ( asset ) => {
					const name = getAssetName( asset );
					return (
						isDevelopmentAsset( name ) ||
						name.startsWith( this.options.manifestFile ) ||
						name.startsWith( this.options.runtimeFile )
					);
				} )
					.map( getAssetName )
					.map( ( name ) => fixupPath( name ) )
			);

			self.outputStream.end( JSON.stringify( statsToOutput, null, '\t' ), callback );
		} );
	},
} );

module.exports = AssetsWriter;
