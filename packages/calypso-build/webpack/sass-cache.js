const crypto = require( 'crypto' );
const fs = require( 'fs' );
const path = require( 'path' );

const cacheDir = path.join( process.cwd(), '.sass-cache' );
if ( ! fs.existsSync( cacheDir ) ) {
	fs.mkdirSync( cacheDir, { recursive: true } );
}

/**
 * Generate an MD5 hash from a URL
 * @param {string} url - The URL to hash
 * @returns {string} The MD5 hash of the URL
 */
const md5Url = ( url ) => {
	return crypto.createHash( 'md5' ).update( url ).digest( 'hex' );
};

/**
 * Get cached Sass compilation result for a URL
 * @param {string} url - The URL to use as cache key
 * @returns {Object|null} The cached compilation result or null if not found
 */
const getDiskCache = ( url ) => {
	const cacheKey = md5Url( url );
	const cachePath = path.join( cacheDir, `${ cacheKey }.json` );

	try {
		if ( fs.existsSync( cachePath ) ) {
			try {
				const sourceStat = fs.statSync( url.replace( 'file://', '' ) );
				const cachedState = fs.statSync( cachePath );

				if ( sourceStat.mtime > cachedState.mtime ) {
					// Delete the stale cache file
					fs.unlink( cachePath, () => {} );

					return null;
				}
			} catch ( e ) {
				console.log( 'omar', e );
			}

			const cacheContent = fs.readFileSync( cachePath, 'utf8' );
			console.log( 'hit', url );
			return JSON.parse( cacheContent );
		}
	} catch ( error ) {
		console.warn( 'Failed to read Sass cache:', error );
	}

	return null;
};

/**
 * Set cached Sass compilation result for a URL
 * @param {string} url - The URL to use as cache key
 * @param {Object} result - The compilation result to cache
 */
const setDiskCache = ( url, result ) => {
	const cacheKey = md5Url( url );
	const cachePath = path.join( cacheDir, `${ cacheKey }.json` );

	try {
		fs.writeFileSync( cachePath, JSON.stringify( result ), 'utf8' );
	} catch ( error ) {
		console.warn( 'Failed to write Sass cache:', error );
	}
};

module.exports = {
	getDiskCache,
	setDiskCache,
};
