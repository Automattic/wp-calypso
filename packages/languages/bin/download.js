/**
 * External dependencies
 */
const https = require( 'https' );
const fs = require( 'fs' );
const path = require( 'path' );

const LANGUAGES_META_URL = 'https://widgets.wp.com/languages/calypso/languages-meta.json';
const FILE_PATH = path.join( __dirname, '../src/languages-meta.json' );

https
	.get( LANGUAGES_META_URL, ( response ) => {
		response.setEncoding( 'utf8' );
		response.pipe( fs.createWriteStream( FILE_PATH ) );
	} )
	.on( 'error', ( error ) => {
		console.error( error );
		process.exit( 1 );
	} );
