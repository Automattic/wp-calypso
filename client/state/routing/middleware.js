/**
 * External dependencies
 */
import debugFactory from 'debug';
import page from 'page';
import store from 'store';

/**
 * Internal dependencies
 */
import { ROUTE_SET } from 'state/action-types';

const debug = debugFactory( 'calypso:restore-last-location' );

let hasInitialized = false;

export const restoreLastLocation = () => ( next ) => ( action ) => {
	if ( action.type === ROUTE_SET && action.path ) {
		const lastPath = store.get( 'last_path' );

		if ( ! hasInitialized && lastPath && lastPath !== '/' && action.path === '/' ) {
			debug( 'redir to', action.path );
			page( lastPath );
		} else {
			debug( 'saving', action.path );
			store.set( 'last_path', action.path );
		}

		if ( ! hasInitialized ) {
			hasInitialized = true;
		}
	}

	return next( action );
};

export default restoreLastLocation;
