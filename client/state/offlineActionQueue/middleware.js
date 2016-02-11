/**
 * External dependencies
 */
import uniqueId from 'lodash/utility/uniqueId';

/**
 * Internal dependencies
 */
import {
	isOffline,
	isOnline
} from 'state/application/selectors';
import {
	OFFLINE_QUEUE_ACTION,
	CONNECTION_RESTORED,
	OFFLINE_QUEUE_REMOVE,
} from 'state/action-types';
const ACTION_TIMEOUT = 10000;

const connections = {};

let actionTimeout = null;

//Prob should be in actions
function queueAction( action ) {
	return {
		type: OFFLINE_QUEUE_ACTION,
		id: uniqueId(),
		dispatchedAt: ( new Date() ).getTime(),
		action: action
	}
}

//Prob should be in actions
function removeAction( id ) {
	return {
		type: OFFLINE_QUEUE_REMOVE,
		id: id
	}
}

//Prob should be in selectors
function getFirstAction( state ) {
	return state.connectionMiddleware.actionQueue[ 0 ];
}

/**
 *  Fires next action from the queue.
 *  Should be called by a wrapped dispatchAndFireNextQueuedAction.
 *  But in case the connectionFunction fails or does not dispatch anything,
 *  debouncer kicks in.
 */
function fireNextQueuedAction( dispatch, state ) {
	clearTimeout( actionTimeout );
	const firstAction = getFirstAction( state );

	if ( isOnline( state ) && firstAction ) {
		dispatch( removeAction( firstAction.id ) );
		setTimeout( fireNextQueuedAction, ACTION_TIMEOUT );
		fireAction( firstAction.action, dispatch, state );
	}
}

/**
 * Wraps dispatch so that any action fired from this method will also fire next
 * queued action.
 * This way we can replay actions 1 by 1.
 * @param  {[type]} dispatch [description]
 * @return {[type]}          [description]
 */
function dispatchAndFireNextQueuedAction( dispatch, state ) {
	return action => {
		dispatch( action );
		fireNextQueuedAction( dispatch, state );
	}
}

function fireAction( action, dispatch, state ) {
	dispatch = dispatchAndFireNextQueuedAction( dispatch, state );
	connections[ action.type ].connectionFunction( dispatch, action );
};

function shouldQueueAction( action ) {
	return ( connections[ action.type ] && connections[ action.type ].offlineQueue );
}

const offlineQueue = store => next => action => {
	if (
		// isOffline( store.getState() ) &&
		shouldQueueAction( action )
	) {
		next( queueAction( action ) );
	} else if ( action.type === CONNECTION_RESTORED ) {
		next( action );
		fireNextQueuedAction( store.dispatch, store.getState() );
	} else if ( connections.hasOwnProperty( action.type ) ) {
		fireAction( action, store.dispatch, store.getState() );
		next( action );
	} else {
		next( action );
	}
};

export function registerConnection( actionType, connectionFunction, options = {} ) {
	connections[ actionType ] = Object.assign( {
		connectionFunction,
		offlineQueue: false
	}, options );
}

export default offlineQueue;
