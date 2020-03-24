/**
 * Internal Dependencies
 */
import { getCurrentUserId } from 'state/current-user/selectors';
// import registerEventHandlers from './events-to-actions';
import { socket } from '../socket';

let channel = null;

export default store => next => action => {
	if ( ! channel && socket && action.type === 'LASAGNA_SOCKET_CONNECTED' ) {
		const userId = getCurrentUserId( store.getState() );
		channel = socket.channel( `user:${ userId }` );
		// registerEventHandlers( channel, store );
		channel.join();
	}

	if ( ! channel ) {
		return next( action );
	}

	// TBD: do stuff
	switch ( action.type ) {
	}

	return next( action );
};
