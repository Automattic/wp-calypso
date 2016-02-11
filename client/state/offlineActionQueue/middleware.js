/**
 * External dependencies
 */
import uniqueId from 'lodash/utility/uniqueId';

/**
 * Internal dependencies
 */
import { isOffline } from 'state/application/selectors';
import {
	OFFLINE_QUEUE_ACTION,
	CONNECTION_RESTORED,
} from 'state/action-types';


function queueAction( action ) {
	return {
		type: OFFLINE_QUEUE_ACTION,
		id: uniqueId(),
		dispatchedAt: Date.getTime(),
		action: action
	}
}

function shouldQueueAction( action ) {
	return ( action.offlineQueue );
}

function replayActions() {

}

const offlineQueue = store => next => action => {
	if ( isOffline( store.getState() && shouldQueueAction( action ) ) ) {
		next( queueAction( action ) );
	} else if ( action.type === CONNECTION_RESTORED ) {
		next( action );
		store.dispatch(  );
		replayActions();
	} else {
		next( action );
	}
};

export default offlineQueue;
