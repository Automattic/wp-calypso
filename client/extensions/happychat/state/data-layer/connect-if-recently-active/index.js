/**
 * Internal dependencies
 */
import {
	wasHappychatRecentlyActive,
} from 'extensions/happychat/state/selectors';
import connectChat from 'extensions/happychat/state/data-layer/connect-chat';

const connectIfRecentlyActive = ( connection ) => ( store ) => {
	if ( wasHappychatRecentlyActive( store.getState() ) ) {
		connectChat( connection )( store );
	}
};

export default connectIfRecentlyActive;
