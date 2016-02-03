/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import { receivePost } from 'state/posts/actions';

/**
 * Object mapping Flux action type to a function which, when called with the
 * Flux action object, returns a Redux action object to be dispatched to the
 * Redux store.
 */
const SYNC_ACTIONS = {
	RECEIVE_POST_TO_EDIT: ( action ) => receivePost( action.post )
};

/**
 * Subscribes to the global Flux dispatcher and dispatches to the provided
 * Redux store instance if an action mapping can be determined when a Flux
 * action is dispatched.
 *
 * @param  {Object} store Redux store instance
 * @return {String}       Dispatcher subscription ID
 */
export default function( store ) {
	return Dispatcher.register( ( payload ) => {
		const handler = SYNC_ACTIONS[ payload.action.type ];
		if ( handler ) {
			store.dispatch( handler( payload.action ) );
		}
	} );
}
