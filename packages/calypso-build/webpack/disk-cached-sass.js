const crypto = require( 'crypto' );
const fs = require( 'fs' );
const path = require( 'path' );
const sass = require( 'sass' );

let cacheDir;
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

function warmUp( sassOptionsHash ) {
	cacheDir = path.join( process.cwd(), '.sass-cache', sassOptionsHash );

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
}

function areDependenciesOutdated( file, changeFileMTime ) {
	return file.content.loadedUrls.some( ( url ) => {
		const cachedFile = cachedReadFile( url );
		return cachedFile && cachedFile.mtime < changeFileMTime;
	} );
}

/**
 * Generate an MD5 hash from a URL
 * @param {string} string - The URL to hash
 * @returns {string} The MD5 hash of the URL
 */
const md5 = ( string ) => {
	return crypto.createHash( 'md5' ).update( string ).digest( 'hex' );
};

/**
 * Get cached Sass compilation result for a URL
 * @param {string} url - The URL to use as cache key
 * @returns {Object|null} The cached compilation result or null if not found
 */
const get = ( url ) => {
	const hashedUrl = md5( url );
	const cachePath = path.join( cacheDir, `${ hashedUrl }.json` );
	const file = cachedReadFile( cachePath );

	if ( file ) {
		try {
			const sourceStat = fs.statSync( url.replace( 'file://', '' ) );
			const cachedStat = file.mtime;

			if ( sourceStat.mtime > cachedStat || areDependenciesOutdated( file, sourceStat.mtime ) ) {
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
		const cacheKey = md5( url );
		const cachePath = path.join( cacheDir, `${ cacheKey }.json` );

		fs.promises.writeFile( cachePath, JSON.stringify( result ), 'utf8' ).catch();
		cacheMap[ cachePath ] = {
			mtime: Date.now(),
			content: result,
		};
	} );
};

/**
 * Create a Sass compiler with disk cache
 * @param {Object} sassOptions - The Sass options
 * @returns {Object} The Sass compiler
 */
module.exports = ( sassOptions ) => {
	// Include sass options in the cache key to to invalidate the cache when the options change.
	const sassOptionsHash = md5( JSON.stringify( sassOptions ) );
	warmUp( sassOptionsHash );

	return {
		...sass,
		compileStringAsync: ( data, rest ) => {
			const url = rest.url.href;
			const cache = get( url );
			if ( cache ) {
				console.log( 'hit', url );
				return cache;
			}
			console.log( 'miss', url );

			const result = sass.compileStringAsync( data, rest );
			set( url, result );
			return result;
		},
	};
};
