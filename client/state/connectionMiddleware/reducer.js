/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	OFFLINE_QUEUE_ACTION,
	OFFLINE_QUEUE_REMOVE
} from 'state/action-types';

export function actionQueue( state = [], action ) {
	if ( action.type === OFFLINE_QUEUE_ACTION ) {
		delete action.type;
		return [ ...state, action ];
	} else 	if ( action.type === OFFLINE_QUEUE_REMOVE ) {
		state = state.filter( queuedAction => ( queuedAction.id !== action.id ) );
	}

	return state;
}

export default combineReducers( {
	actionQueue
} );
