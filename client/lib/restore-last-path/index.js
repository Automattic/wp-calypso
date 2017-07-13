/**
 * Internal dependencies
 */
import localforage from 'lib/localforage';

/**
 * External dependencies
 */
import { isOutsideCalypso } from 'lib/url';

const LAST_PATH = 'last_path';
const ALLOWED_PATHS_FOR_RESTORING = /^\/(read|stats|plans|view|posts|pages|media|types|themes|sharing|people|plugins|domains)/i;

function isWhitelistedForRestoring( path ) {
	return !! path.match( ALLOWED_PATHS_FOR_RESTORING );
}

function readLastPath() {
	return localforage.getItem( LAST_PATH );
}

// Throws an Error when no path or an invalid path is provided
function validatePath( path ) {
	if ( typeof path !== 'string' || ! path.length ) {
		throw 'path is empty';
	}

	if ( ! isWhitelistedForRestoring( path ) ) {
		throw 'path is not whitelisted: ' + path;
	}

	if ( isOutsideCalypso( path ) ) {
		throw 'path is "outside" Calypso: ' + path;
	}
}

function getSavedPath() {
	return new Promise( ( resolve, reject ) => {
		readLastPath()
			.then( ( lastPath ) => {
				validatePath( lastPath );
				resolve( lastPath );
			} )
			.catch( ( reason ) => reject( reason ) );
	} );
}

function savePath( path ) {
	return new Promise( ( resolve, reject ) => {
		try {
			validatePath( path );
		} catch ( e ) {
			return reject( e );
		}

		readLastPath()
			.then( ( lastPath ) => {
				if ( lastPath === path ) {
					return reject( 'path is identical' );
				}
				localforage.setItem( LAST_PATH, path ).then( () => resolve() );
			} )
			.catch( ( reason ) => reject( reason ) );
	} );
}

export default {
	isWhitelistedForRestoring,
	getSavedPath,
	savePath,
};
