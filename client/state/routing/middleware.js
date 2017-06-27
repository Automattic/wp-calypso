/**
 * External dependencies
 */
import debugFactory from 'debug';
import page from 'page';

/**
 * Internal dependencies
 */
import {
	getSavedPath,
	savePath,
} from 'lib/restore-last-path';
import { ROUTE_SET } from 'state/action-types';

const debug = debugFactory( 'calypso:restore-last-location' );
let hasInitialized = false;

export const routingMiddleware = () => {
	return ( next ) => ( action ) => {
		if ( action.type !== ROUTE_SET || ! action.path || ! action.query ) {
			return next( action );
		}

		if ( Object.keys( action.query ).length !== 0 ) {
			return next( action );
		}

		const firstRun = ! hasInitialized;
		hasInitialized = true;

		if ( firstRun && action.path === '/' ) {
			return getSavedPath()
					.then( ( lastPath ) => {
						debug( 'restoring: ' + lastPath );
						page( lastPath );
						return;
					} )
					.catch( ( reason ) => {
						debug( 'cannot restore', reason );
						next( action );
					} );
		}

		savePath( action.path )
			.then( () => debug( 'saved path: ' + action.path ) )
			.catch( ( reason ) => debug( 'error saving path', reason ) );

		next( action );
	};
};

export default routingMiddleware;
