/** @format */
/**
 * External dependencies
 */
import wp from 'lib/wp';
import debugFactory from 'debug';

/**
 * Module vars
 */
const wpcomUndoc = wp.undocumented();
const debug = debugFactory( 'calypso:state:site:updates' );

import {
	siteUpdatesRequestAction,
	siteUpdatesRequestSuccessAction,
	siteUpdatesReceiveAction,
	siteUpdatesRequestFailureAction,
} from './actions';

export function requestSiteUpdates( siteId ) {
	debug( 'requestSiteUpdates(%o) called', siteId );

	return dispatch => {
		dispatch( siteUpdatesRequestAction( siteId ) );
		debug( 'dispatching siteUpdatesRequestAction(%o) action', siteId );

		return wpcomUndoc
			.getAvailableUpdates( siteId )
			.then( ( updates = {} ) => {
				debug( 'dispatching siteUpdatesRequestSuccessAction(%o) action', siteId );
				dispatch( siteUpdatesRequestSuccessAction( siteId ) );

				debug( 'dispatching siteUpdatesReceiveAction(%o, %o ) action', siteId, updates );
				dispatch( siteUpdatesReceiveAction( siteId, updates ) );
			} )
			.catch( error => {
				const message = error instanceof Error ? error.message : error;

				debug( 'dispatching siteUpdatesRequestFailureAction(%o) action', siteId );
				dispatch( siteUpdatesRequestFailureAction( siteId, message ) );
			} );
	};
}
