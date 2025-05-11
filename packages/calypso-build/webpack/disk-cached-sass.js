const crypto = require( 'crypto' );
const fs = require( 'fs' );
const path = require( 'path' );
const sass = require( 'sass' );

const cacheDir = path.join( process.cwd(), '.sass-cache' );
const cacheMap = {};

/**
 * readFileSync but keeps the file in memory and parses it as JSON.
 * @param {string} fullPath - The path to the file to read
 * @returns {Object | null} The (cached) file and its mtime or null if the file does not exist.
 */
function cachedReadFile( fullPath ) {
	if ( cacheMap[ fullPath ] ) {
		return cacheMap[ fullPath ];
	} else if ( fs.existsSync( fullPath ) ) {
		const cacheContent = fs.readFileSync( fullPath, 'utf8' );
		const { mtime } = fs.statSync( fullPath );

		try {
			return ( cacheMap[ fullPath ] = {
				mtime: mtime,
				content: JSON.parse( cacheContent ),
			} );
		} catch ( error ) {
			return null;
		}
	}
	return null;
}

if ( ! fs.existsSync( cacheDir ) ) {
	fs.mkdirSync( cacheDir, { recursive: true } );
} else {
	// Preload all the files in memory upfront. This is fast (under 500ms).
	// Reading the files in one go adds overhead, but this is still faster (probably because it gets rid of context switching).
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
				// Delete the stale cache file without blocking the main thread.
				fs.promises.unlink( cachePath );
				delete cacheMap[ cachePath ];
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
		cacheMap[ cachePath ] = {
			mtime: Date.now(),
			content: result,
		};
	} );
};

module.exports = {
	...sass,
	compileStringAsync: ( data, rest ) => {
		const url = rest.url.href;
		const cache = get( url );
		if ( cache ) {
			return cache;
		}
		const result = sass.compileStringAsync( data, rest );
		set( url, result );
		return result;
	},
};
