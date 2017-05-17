/**
 * External dependencies
 */
import debugFactory from 'debug';
import page from 'page';

/**
 * Internal dependencies
 */
import localforage from 'lib/localforage';
import { ROUTE_SET } from 'state/action-types';

const debug = debugFactory( 'calypso:restore-last-location' );
const key = 'last_path';

let hasInitialized = false;

export const restoreLastLocation = () => ( next ) => ( action ) => {
	if ( action.type === ROUTE_SET && action.path ) {
		localforage.getItem( key ).then( ( lastPath ) => {
			if ( ! hasInitialized && lastPath && lastPath !== '/' && action.path === '/' ) {
				debug( 'redir to', lastPath );
				page( lastPath );
			} else if ( action.path !== lastPath ) {
				debug( 'saving', action.path );
				localforage.setItem( key, action.path );
			}

			if ( ! hasInitialized ) {
				hasInitialized = true;
			}
		} );
	}

	return next( action );
};

export default restoreLastLocation;
