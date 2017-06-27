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

function validatePath( path ) {
	const errors = [];
	if ( ! isWhitelistedForRestoring( path ) ) {
		errors.push( 'path is not whitelisted: ' + path );
	}

	if ( isOutsideCalypso( path ) ) {
		errors.push( 'path is "outside" Calypso: ' + path );
	}
	return errors;
}

function getSavedPath() {
	return new Promise( ( resolve, reject ) => {
		readLastPath()
			.then( ( lastPath ) => {
				const errors = validatePath( lastPath );
				if ( errors.length ) {
					return reject( errors );
				}
				resolve( lastPath );
			} )
			.catch( ( reason ) => reject( reason ) );
	} );
}

function savePath( path ) {
	return new Promise( ( resolve, reject ) => {
		const errors = validatePath( path );
		if ( errors.length ) {
			return reject( errors );
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
