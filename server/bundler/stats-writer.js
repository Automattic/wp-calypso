/** @format */
/**
 * External Dependencies
 */
const fs = require( 'fs' ); // eslint-disable-line  import/no-nodejs-modules
const path = require( 'path' );

function StatsWriter( options ) {
	this.options = Object.assign(
		{
			path: './build',
			filename: 'stats.json',
			stats: {
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
			},
		},
		options
	);
	this.createOutputStream();
}

Object.assign( StatsWriter.prototype, {
	createOutputStream: function() {
		this.outputPath = path.join( this.options.path, this.options.filename );
		this.outputStream = fs.createWriteStream( this.outputPath );
	},
	apply: function( compiler ) {
		const self = this;

		compiler.hooks.afterEmit.tap( 'StatsWriter', compilation => {
			const stats = compilation.getStats().toJson( this.options.stats );
			self.outputStream.write( JSON.stringify( stats, null, '\t' ) );
		} );
	},
} );

module.exports = StatsWriter;
