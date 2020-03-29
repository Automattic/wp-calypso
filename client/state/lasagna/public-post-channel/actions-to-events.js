/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal Dependencies
 */
import registerEventHandlers from './events-to-actions';
import registerPresence from '../presence';
import { socket } from '../socket';

let channel = null;
const debug = debugFactory( 'lasagna:channel:public-post' );

export default store => next => action => {
	switch ( action.type ) {
		case 'READER_POST_SEEN': {
			// READER_POST_FULL_VIEW
			const {
				payload: { site, post },
			} = action;

			if ( site.is_private ) {
				break;
			}

			channel = socket.channel( `public:uni~presence:${ post.global_ID }` );
			registerEventHandlers( channel, store );
			registerPresence( channel, store, post.global_ID );
			channel
				.join()
				.receive( 'ok', () => debug( 'channel join ok' ) )
				.receive( 'error', ( { reason } ) => {
					debug( 'channel join error', reason );
					channel.leave();
					channel = null;
				} );
			break;
		}

		case 'ROUTE_SET': // READER_POST_FULL_VIEW_LEAVE
			if ( channel ) {
				channel.leave();
				channel = null;
			}
			break;
	}

	return next( action );
};
