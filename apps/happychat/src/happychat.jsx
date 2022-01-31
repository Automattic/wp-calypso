import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Composer from 'calypso/components/happychat/composer';
import HappychatConnection from 'calypso/components/happychat/connection-connected';
import Notices from 'calypso/components/happychat/notices';
import Timeline from 'calypso/components/happychat/timeline';
import { isOutsideCalypso } from 'calypso/lib/url';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import {
	sendEvent,
	sendMessage,
	sendNotTyping,
	sendTyping,
} from 'calypso/state/happychat/connection/actions';
import canUserSendMessages from 'calypso/state/happychat/selectors/can-user-send-messages';
import getHappychatChatStatus from 'calypso/state/happychat/selectors/get-happychat-chat-status';
import getHappychatConnectionStatus from 'calypso/state/happychat/selectors/get-happychat-connection-status';
import getCurrentMessage from 'calypso/state/happychat/selectors/get-happychat-current-message';
import getHappychatTimeline from 'calypso/state/happychat/selectors/get-happychat-timeline';
import isHappychatServerReachable from 'calypso/state/happychat/selectors/is-happychat-server-reachable';
import { setCurrentMessage } from 'calypso/state/happychat/ui/actions';
import './happychat.scss';

function ParentConnection( { chatStatus } ) {
	const dispatch = useDispatch();

	// listen to messages from parent window
	useEffect( () => {
		function onMessage( e ) {
			const message = e.data;
			switch ( message.type ) {
				case 'opened':
					if ( message.opened ) {
						dispatch( sendEvent( 'Started looking at Happychat' ) );
					} else {
						dispatch( sendEvent( 'Stopped looking at Happychat' ) );
					}
					break;
				case 'route':
					dispatch( sendEvent( `Looking at ${ message.route }` ) );
					break;
			}
		}

		window.addEventListener( 'message', onMessage );
		return () => window.removeEventListener( 'message', onMessage );
	}, [ dispatch ] );

	// notify parent window about chat status changes
	useEffect( () => {
		window.parent.postMessage( { chatStatus }, '*' );
	}, [ chatStatus ] );

	return null;
}

export default function Happychat() {
	const dispatch = useDispatch();
	const currentUser = useSelector( getCurrentUser );
	const chatStatus = useSelector( getHappychatChatStatus );
	const connectionStatus = useSelector( getHappychatConnectionStatus );
	const timeline = useSelector( getHappychatTimeline );
	const message = useSelector( getCurrentMessage );
	const isServerReachable = useSelector( isHappychatServerReachable );
	const disabled = ! useSelector( canUserSendMessages );

	const isMessageFromCurrentUser = ( { user_id, source } ) => {
		return user_id.toString() === currentUser.ID.toString() && source === 'customer';
	};

	return (
		<div className="happychat__container">
			<HappychatConnection />
			<ParentConnection chatStatus={ chatStatus } />
			<Timeline
				currentUserEmail={ currentUser.email }
				isCurrentUser={ isMessageFromCurrentUser }
				isExternalUrl={ isOutsideCalypso }
				timeline={ timeline }
			/>
			<Notices
				chatStatus={ chatStatus }
				connectionStatus={ connectionStatus }
				isServerReachable={ isServerReachable }
			/>
			<Composer
				disabled={ disabled }
				message={ message }
				onSendMessage={ ( msg ) => dispatch( sendMessage( msg ) ) }
				onSendNotTyping={ () => dispatch( sendNotTyping() ) }
				onSendTyping={ () => dispatch( sendTyping() ) }
				onSetCurrentMessage={ ( msg ) => dispatch( setCurrentMessage( msg ) ) }
			/>
		</div>
	);
}
