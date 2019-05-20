'use strict';

const path = require( 'path' );
const util = require( 'util' );
const SassConfig = require( '@automattic/calypso-build/webpack/sass' );
const { cssNameFromFilename } = require( '@automattic/calypso-build/webpack/util' );

const outputFilename = '[name].js';
const outputChunkFilename = '[name].js';

const cssFilename = cssNameFromFilename( outputFilename );
const cssChunkFilename = cssNameFromFilename( outputChunkFilename );

module.exports = async ( { config } ) => {
	config.module.rules.push(
		SassConfig.loader( {
			preserveCssCustomProperties: true,
			includePaths: [ path.join( __dirname, '../client' ) ],
			prelude: `@import '${ path.join(
				__dirname,
				'../assets/stylesheets/shared/_utils.scss'
			) }'; @import '${ path.join(
				__dirname,
				'../node_modules/@automattic/calypso-color-schemes/src/calypso-color-schemes.scss'
			) }';`,
		} )
	);
	config.plugins.push(
		...SassConfig.plugins( {
			chunkFilename: cssChunkFilename,
			filename: cssFilename,
			minify: false,
		} )
	);
	return config;
};
