/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal Dependencies
 */
import registerEventHandlers from './events-to-actions';
import { socket } from '../socket';

let channel = null;
const channelTopicPrefix = 'public:push:wp_post:';

const debug = debugFactory( 'lasagna:channel:public:push:wp_post' );

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

			channel = socket.channel( channelTopicPrefix + post.global_ID );
			registerEventHandlers( channel, store );
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
