import { useEffect, useState } from 'react';
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
	sendUserInfo,
	setChatCustomFields,
	setChatTag,
} from 'calypso/state/happychat/connection/actions';
import {
	HAPPYCHAT_CONNECTION_STATUS_CONNECTING,
	HAPPYCHAT_CONNECTION_STATUS_CONTINUING_SESSION,
} from 'calypso/state/happychat/constants';
import canUserSendMessages from 'calypso/state/happychat/selectors/can-user-send-messages';
import getHappychatChatStatus from 'calypso/state/happychat/selectors/get-happychat-chat-status';
import getHappychatConnectionStatus from 'calypso/state/happychat/selectors/get-happychat-connection-status';
import getCurrentMessage from 'calypso/state/happychat/selectors/get-happychat-current-message';
import getHappychatTimeline from 'calypso/state/happychat/selectors/get-happychat-timeline';
import isHappychatServerReachable from 'calypso/state/happychat/selectors/is-happychat-server-reachable';
import { setCurrentMessage, closeChat } from 'calypso/state/happychat/ui/actions';
import { getUserInfo } from './getUserInfo';

import './happychat.scss';

const parentTarget = window.parent;

function getReceivedMessagesOlderThan( timestamp, messages ) {
	if ( ! timestamp ) {
		return [];
	}
	return messages.filter( ( m ) => m.timestamp >= timestamp && m.source !== 'customer' );
}

function ParentConnection( { chatStatus, timeline, geoLocation } ) {
	const dispatch = useDispatch();
	const [ blurredAt, setBlurredAt ] = useState( 0 );
	const [ introMessage, setIntroMessage ] = useState( null );
	const [ windowState, setWindowState ] = useState();

	// listen to messages from parent window
	useEffect( () => {
		function onMessage( e ) {
			const message = e.data;
			switch ( message.type ) {
				case 'happy-chat-introduction-data':
					if ( ! introMessage && message !== introMessage ) {
						dispatch(
							setChatCustomFields( {
								calypsoSectionName: 'gutenberg-editor',
								wpcomSiteId: message.siteId?.toString(),
								wpcomSitePlan: message.planSlug,
								...( message.extraFields || {} ),
							} )
						);
						dispatch( setChatTag( message.chatTag ) );
						dispatch(
							sendUserInfo(
								getUserInfo(
									message.message,
									message.siteUrl,
									message.siteId?.toString(),
									geoLocation
								)
							)
						);
						dispatch( sendMessage( message.message, { includeInSummary: true } ) );
						setIntroMessage( message );
					}
					break;

				case 'window-state-change':
					setWindowState( message.state );
					break;
			}
		}
		window.addEventListener( 'message', onMessage );

		return () => window.removeEventListener( 'message', onMessage );
	}, [ dispatch, introMessage, geoLocation ] );

	// notify parent window about chat closing
	useEffect( () => {
		if ( chatStatus === 'closed' ) {
			parentTarget?.postMessage(
				{
					type: 'window-state-change',
					state: 'ended',
				},
				'*'
			);
		}
	}, [ chatStatus ] );

	// handle window status
	useEffect( () => {
		switch ( windowState ) {
			case 'minimized':
				setBlurredAt( Date.now() );
				dispatch( sendEvent( 'User minimized HelpCenter' ) );
				break;

			case 'maximized':
				setBlurredAt( 0 );
				dispatch( sendEvent( 'User maximized HelpCenter' ) );
				break;

			case 'closed':
				dispatch( sendEvent( 'User closed HelpCenter' ) );
				dispatch( closeChat() );
				break;
		}
	}, [ dispatch, windowState ] );

	// request intro data
	useEffect( () => {
		parentTarget?.postMessage(
			{
				type: 'happy-chat-introduction-data',
			},
			'*'
		);
	}, [ dispatch ] );

	useEffect( () => {
		const unreadMessageCount = getReceivedMessagesOlderThan( blurredAt, timeline ).length;
		parentTarget?.postMessage(
			{
				type: 'calypso-happy-chat-unread-messages',
				state: unreadMessageCount,
			},
			'*'
		);
	}, [ blurredAt, timeline ] );

	return null;
}

export default function Happychat( { auth } ) {
	const dispatch = useDispatch();
	const currentUser = useSelector( getCurrentUser );
	const chatStatus = useSelector( getHappychatChatStatus );
	let connectionStatus = useSelector( getHappychatConnectionStatus );
	const timeline = useSelector( getHappychatTimeline );
	const message = useSelector( getCurrentMessage );
	const isServerReachable = useSelector( isHappychatServerReachable );
	const disabled = ! useSelector( canUserSendMessages );
	const isMessageFromCurrentUser = ( { user_id, source } ) => {
		return user_id.toString() === currentUser.ID.toString() && source === 'customer';
	};
	const isContinuedSession =
		new URLSearchParams( window.location.search ).get( 'session' ) === 'continued';

	if ( isContinuedSession && connectionStatus === HAPPYCHAT_CONNECTION_STATUS_CONNECTING ) {
		connectionStatus = HAPPYCHAT_CONNECTION_STATUS_CONTINUING_SESSION;
	}
	return (
		<div className="happychat__container">
			<HappychatConnection getAuth={ () => Promise.resolve( auth ) } isHappychatEnabled />
			<ParentConnection
				connectionStatus={ connectionStatus }
				timeline={ timeline }
				chatStatus={ chatStatus }
				geoLocation={ auth.user.geo_location }
			/>
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
