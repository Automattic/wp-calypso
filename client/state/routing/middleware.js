/**
 * External dependencies
 */
import debugFactory from 'debug';
import page from 'page';

/**
 * Internal dependencies
 */
import localforage from 'lib/localforage';
import { isOutsideCalypso } from 'lib/url';
import { ROUTE_SET } from 'state/action-types';

const debug = debugFactory( 'calypso:restore-last-location' );
const LAST_PATH = 'last_path';
const ALLOWED_PATHS = /^\/(stats|plans|view|posts|pages|media|types|themes|sharing|people|plugins|domains)/i;

const isWhitelistedForRestoring = ( path ) => {
	return !! path.match( ALLOWED_PATHS );
};

export const restoreLastLocation = () => {
	let hasInitialized = false;

	return ( next ) => ( action ) => {
		if ( action.type !== ROUTE_SET || ! action.path ) {
			return next( action );
		}

		localforage.getItem( LAST_PATH ).then(
			( lastPath ) => {
				if ( ! hasInitialized &&
						lastPath && lastPath !== '/' &&
						action.path === '/' && Object.keys( action.query ).length === 0 &&
						! isOutsideCalypso( lastPath ) &&
						isWhitelistedForRestoring( lastPath ) ) {
					debug( 'redir to', lastPath );
					page( lastPath );
				} else if ( action.path !== lastPath &&
						! isOutsideCalypso( action.path ) ) {
					debug( 'saving', action.path );
					localforage.setItem( LAST_PATH, action.path );
				}

				if ( ! hasInitialized ) {
					hasInitialized = true;
				}

				return next( action );
			},
			() => next( action )
		);
	};
};

export default restoreLastLocation;
