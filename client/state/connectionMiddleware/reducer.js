/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { createReducer } from 'state/utils';
import matchesProperty from 'lodash/matchesProperty';

/**
 * Internal dependencies
 */
import {
	OFFLINE_QUEUE_ADD,
	OFFLINE_QUEUE_REMOVE,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';

export const actionQueue = createReducer( [], {
	[ OFFLINE_QUEUE_ADD ]: ( queuedActions, action ) => {
		const shouldQueueAction = ! (
			action.squash &&
			queuedActions.some( matchesProperty( 'hash', action.hash ) )
		);

		if ( shouldQueueAction ) {
			delete action.type;
			return [ ...queuedActions, action ];
		}
		return queuedActions;
	},
	[ OFFLINE_QUEUE_REMOVE ]: ( state, action ) => state.filter( queuedAction => ( queuedAction.id !== action.id ) ),
	[ SERIALIZE ]: state => state,
	[ DESERIALIZE ]: state => state,
} );

export default combineReducers( {
	actionQueue
} );
