import { isOffline } from 'state/application/selectors';

function queueAction( action ) {

}

function isQueueWhitelist( action ) {

}

const offlineQueue = store => next => action => {
	if ( isOffline( store.getState() && isQueueWhitelist( action ) ) ) {
		action = queueAction( action );
	}

	next( action );
};

export default offlineQueue;
