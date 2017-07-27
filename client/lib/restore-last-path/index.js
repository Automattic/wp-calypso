/**
 * External dependencies
 */
import debugFactory from 'debug';
import page from 'page';
import store from 'store';

/**
 * Internal dependencies
 */
import { isOutsideCalypso } from 'lib/url';

const debug = debugFactory( 'calypso:restore-last-path' );

const LAST_PATH = 'last_path';
const ALLOWED_PATHS_FOR_RESTORING = /^\/(read|stats|plans|view|posts|pages|media|types|themes|sharing|people|plugins|domains)/i;

function isWhitelistedForRestoring( path ) {
	return !! path.match( ALLOWED_PATHS_FOR_RESTORING );
}

/**
 * Pull the device's last validated location (if any) out of storage
 *
 * We're intentionally using store / localStorage in this module.
 * localForage is usually preferable, but would mean a signifcant
 * refactor of server/bundler/loader to use an asynchronous API there.
 *
 * @return {void}
 */
function readLastPath() {
	return store.get( LAST_PATH );
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
	const lastPath = readLastPath();
	try {
		validatePath( lastPath );
		return lastPath;
	} catch ( e ) {
		debug( e );
	}
}

/**
 * Validate the passed path & save it to the local device for future retrieval
 *
 * We're intentionally using store / localStorage in this module.
 * localForage is usually preferable, but would mean a signifcant
 * refactor of server/bundler/loader to use an asynchronous API there.
 *
 * @param  {string} path The current location within calypso to be potentially saved
 * @return {Promise}      * Rejected if path validation fails or the saved path did not change
 *                        * Resolved if the path was saved
 */
export function savePath( path ) {
	return new Promise( ( resolve, reject ) => {
		try {
			validatePath( path );
		} catch ( e ) {
			return reject( e );
		}

		const lastPath = readLastPath();
		if ( lastPath === path ) {
			return reject( 'path is identical' );
		}
		store.set( LAST_PATH, path );
		resolve();
	} );
}

let isFirstRun = true;
export function restoreLastSession( currentPath ) {
	debug( 'Entering restoreLastSession. Current path is: ' + ( currentPath || 'empty' ) );

	if ( ! isFirstRun ) {
		debug( 'not first run, skipping' );
		return false;
	}

	const lastPath = getSavedPath();
	debug( 'found', lastPath );
	isFirstRun = false;
	if ( currentPath === '/' && lastPath ) {
		debug( 'redir to', lastPath );
		page( lastPath );
		return true;
	}

	debug( 'Not restoring lastPath. Moving on' );

	return false;
}
