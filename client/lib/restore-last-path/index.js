/** @format */
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
const ALLOWED_PATHS_FOR_RESTORING = /^\/(stats|plans|view|posts|pages|media|types|themes|sharing|people|plugins|domains)/i;

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
		if ( ! path || path === '/' ) {
			store.remove( LAST_PATH );
			return resolve( 'emptied saved path' );
		}

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
		resolve( 'saved path: ' + path );
	} );
}

// Store a module-level variable to enforce restoreLastSession only runs once per session
let isFirstRun = true;

/**
 * This is called early in the loading process to attempt to restore a device to
 * the last path it visited (if valid). It returns a boolean value so the caller
 * knows whether to return (i.e. the path is being restored) or continue (it is not).
 *
 * @param  {string} currentPath The current path from the caller's context
 * @return {boolean}             True if path was restored. False if not.
 */
export function restoreLastSession( currentPath ) {
	if ( ! isFirstRun ) {
		// not first run, skipping
		return false;
	}
	isFirstRun = false;

	const lastPath = getSavedPath();
	if ( currentPath === '/' && lastPath ) {
		// Redirect & return `true` so the caller knows to return
		page( lastPath );
		return true;
	}

	// Not restoring lastPath. Moving on.
	return false;
}
