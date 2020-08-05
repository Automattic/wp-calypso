/**
 * External dependencies
 */
const https = require( 'https' );
const fs = require( 'fs' );

const LANGUAGES_META_URL = 'https://widgets.wp.com/languages/calypso/languages-meta.json';
const FILE_PATH = 'client/languages/languages-meta.json';

https
	.get( LANGUAGES_META_URL, ( response ) => {
		response.setEncoding( 'utf8' );
		response.pipe( fs.createWriteStream( FILE_PATH ) );
	} )
	.on( 'error', ( error ) => {
		if ( process.env.CALYPSO_ENV === 'production' ) {
			console.error( error );
			process.exit( 1 );
		}

		console.error(
			`Failed to download ${ LANGUAGES_META_URL }. Calypso will be built with pre-defined languages data from stored in 'client/languages/fallback-languages-meta.json'.`
		);
	} );
