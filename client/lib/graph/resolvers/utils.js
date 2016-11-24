/**
 * Internal dependencies
 */
import { getRequest, getRequestIgnoringUid } from 'state/requests/selectors';
import { addRequest, removeRequest } from 'state/requests/actions';

export const refreshByUid = ( store, uid, type, options, triggerRequest ) => {
	const state = store.getState();
	const request = getRequest( state, uid, type, options );
	if ( ! request ) {
		store.dispatch( addRequest( uid, type, options ) );
		triggerRequest();
	}
};

export const refreshWhenExpired = ( store, type, options, timeout, triggerRequest ) => {
	const state = store.getState();
	const request = getRequestIgnoringUid( state, type, options );
	const refresh = ! request || ( Date.now() - request.createdAt >= timeout );

	if ( refresh ) {
		if ( request ) {
			store.dispatch( removeRequest( request.uid, type, options ) );
		}
		store.dispatch( addRequest( '', type, options ) );
		triggerRequest();
	}
};
