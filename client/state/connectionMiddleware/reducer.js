/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	OFFLINE_QUEUE_ADD,
	OFFLINE_QUEUE_REMOVE
} from 'state/action-types';

export function actionQueue( state = [], action ) {
	if ( action.type === OFFLINE_QUEUE_ADD ) {
		let shouldQueueAction = true;

		if ( action.squash ) {
			const previousCalls = state.filter( storedAction =>
				( storedAction.hash === action.hash )
			);
			shouldQueueAction = ( previousCalls.length === 0 );
		}

		if ( shouldQueueAction ) {
			delete action.type;
			return [ ...state, action ];
		}
	} else 	if ( action.type === OFFLINE_QUEUE_REMOVE ) {
		state = state.filter( queuedAction => ( queuedAction.id !== action.id ) );
	}

	return state;
}

export default combineReducers( {
	actionQueue
} );
