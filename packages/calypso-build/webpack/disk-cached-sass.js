const crypto = require( 'crypto' );
const fs = require( 'fs' );
const path = require( 'path' );

const cacheDir = path.join( process.cwd(), '.sass-cache' );
const cacheMap = {};

/**
 * readFileSync but keeps the file in memory.
 * @param {string} fullPath - The path to the file to read
 * @returns {Object | null} The (cached) file and its mtime or null if the file does not exist.
 */
function cachedReadFile( fullPath ) {
	if ( cacheMap[ fullPath ] ) {
		return cacheMap[ fullPath ];
	} else if ( fs.existsSync( fullPath ) ) {
		const cacheContent = fs.readFileSync( fullPath, 'utf8' );
		const cachedState = fs.statSync( fullPath );

		return ( cacheMap[ fullPath ] = {
			mtime: cachedState.mtime,
			content: JSON.parse( cacheContent ),
		} );
	}
	return null;
}

// Preload all the files in memory upfront. This is incredibly fast (under 500ms).
if ( ! fs.existsSync( cacheDir ) ) {
	fs.mkdirSync( cacheDir, { recursive: true } );
} else {
	const files = fs.readdirSync( cacheDir );
	for ( const file of files ) {
		cachedReadFile( path.join( cacheDir, file ) );
	}
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
const get = ( url ) => {
	const cacheKey = md5Url( url );
	const cachePath = path.join( cacheDir, `${ cacheKey }.json` );
	const file = cachedReadFile( cachePath );

	if ( file ) {
		try {
			const sourceStat = fs.statSync( url.replace( 'file://', '' ) );
			const cachedStat = file.mtime;

			if ( sourceStat.mtime > cachedStat ) {
				console.log( 'Deleting stale cache file', cachePath );
				// Delete the stale cache file without blocking the main thread.
				fs.promises.unlink( cachePath );
				return null;
			}
		} catch {}

		return file.content;
	}

	return null;
};

/**
 * Set cached Sass compilation result for a URL
 * @param {string} url - The URL to use as cache key
 * @param {Promise<Object>} resultPromise - The promise of compilation result to cache
 */
const set = ( url, resultPromise ) => {
	// Cache the file without blocking the main thread.
	resultPromise.then( ( result ) => {
		const cacheKey = md5Url( url );
		const cachePath = path.join( cacheDir, `${ cacheKey }.json` );

		fs.promises.writeFile( cachePath, JSON.stringify( result ), 'utf8' ).catch();
	} );
};

module.exports = {
	...require( 'sass' ),
	compileStringAsync: ( data, rest ) => {
		const url = rest.url.href;
		const cache = get( url );
		if ( cache ) {
			return cache;
		}
		const result = require( 'sass' ).compileStringAsync( data, rest );
		set( url, result );
		return result;
	},
};
