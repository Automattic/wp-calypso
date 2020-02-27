/**
 * External dependencies
 */
const crypto = require( 'crypto' );
const fs = require( 'fs' );
const qs = require( 'qs' );

/**
 * Internal dependecies
 */
const config = require( '../config' );

const HASH_LENGTH = 10;
const URL_BASE_PATH = '/calypso';

function hashFile( path ) {
	const md5 = crypto.createHash( 'md5' );
	let data, hash;

	try {
		data = fs.readFileSync( path );
		md5.update( data );
		hash = md5.digest( 'hex' );
		hash = hash.slice( 0, HASH_LENGTH );
	} catch ( e ) {
		hash = new Date().getTime().toString();
	}

	return hash;
}

function getUrl( filename, hash ) {
	return (
		URL_BASE_PATH +
		'/' +
		filename +
		'?' +
		qs.stringify( {
			v: hash,
		} )
	);
}

const activeSections = config( 'sections' );
const byDefaultDisableSection = config( 'disable_sections' );

function filterSections( section ) {
	if ( activeSections && activeSections[ section.name ] ) {
		return activeSections[ section.name ];
	}
	return ! byDefaultDisableSection;
}

module.exports = {
	hashFile: hashFile,
	getUrl: getUrl,
	filterSections: filterSections,
};
