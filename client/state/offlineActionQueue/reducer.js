/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	OFFLINE_QUEUE_ACTION
} from 'state/action-types';

export function actionQueue( state = [], action ) {
	if ( action.type === OFFLINE_QUEUE_ACTION ) {
		delete action.type;
		state = [ ...state, action ];
	}
	return state;
}

export default combineReducers( {
	actionQueue
} );
