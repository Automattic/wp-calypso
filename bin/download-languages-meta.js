/**
 * External dependencies
 */
const https = require( 'https' );
const fs = require( 'fs' );

const LANGUAGES_META_URL = 'https://widgets.wp.com/languages/calypso/languages.json';
const FILE_PATH = 'client/languages-meta.json';

const file = fs.createWriteStream( FILE_PATH );

https.get( LANGUAGES_META_URL, ( response ) => {
	response.setEncoding( 'utf8' );
	response.pipe( file );
} );
