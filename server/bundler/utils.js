/** @format */
/**
 * External dependencies
 */
const crypto = require( 'crypto' );
const fs = require( 'fs' );
const qs = require( 'qs' );

const HASH_LENGTH = 10;
const URL_BASE_PATH = '/calypso';
const SERVER_BASE_PATH = '/public';

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

function getHashedUrl( filename ) {
	return getUrl( filename, hashFile( process.cwd() + SERVER_BASE_PATH + '/' + filename ) );
}

function getCssUrls( css ) {
	return {
		ltr: getHashedUrl( 'sections/' + css + '.css' ),
		rtl: getHashedUrl( 'sections-rtl/' + css + '.rtl.css' ),
	};
}

module.exports = {
	hashFile: hashFile,
	getUrl: getUrl,
	getCssUrls: getCssUrls,
};
