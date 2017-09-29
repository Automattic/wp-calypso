/**
 * Internal dependencies
 */
import {
	isHappychatClientConnected,
	isHappychatChatAssigned,
} from 'extensions/happychat/state/selectors';

const sendEvent = ( connection, getEventMessage ) => ( store, action ) => {
	const state = store.getState();
	if ( isHappychatClientConnected( state ) &&
		isHappychatChatAssigned( state ) ) {
		connection.sendEvent( getEventMessage[ action.type ]( store, action ) );
	}
};
export default sendEvent;
