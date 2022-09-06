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
} from 'calypso/state/happychat/connection/actions';
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

function ParentConnection( { chatStatus, timeline, connectionStatus, geoLocation } ) {
	const dispatch = useDispatch();
	const [ blurredAt, setBlurredAt ] = useState( 0 );
	const [ introMessage, setIntroMessage ] = useState( null );
	const [ windowState, setWindowState ] = useState();

	// listen to messages from parent window
	useEffect( () => {
		function onMessage( e ) {
			const message = e.data;
			switch ( message.type ) {
				case 'route':
					dispatch( sendEvent( `Looking at ${ message.route }` ) );
					break;
				case 'happy-chat-introduction-data':
					if ( ! introMessage ) {
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
	}, [ dispatch, introMessage ] );

	useEffect( () => {
		if ( connectionStatus === 'connected' && introMessage ) {
			dispatch(
				setChatCustomFields( {
					calypsoSectionName: 'gutenberg-editor',
					wpcomSiteId: introMessage.siteId?.toString(),
					wpcomSitePlan: introMessage.planSlug,
				} )
			);
			// forward the message from the form
			if ( introMessage.message ) {
				dispatch(
					sendUserInfo(
						getUserInfo(
							introMessage.message,
							introMessage.siteUrl,
							introMessage.siteId?.toString(),
							geoLocation
						)
					)
				);
				dispatch( sendMessage( introMessage.message, { includeInSummary: true } ) );
			}
		}
	}, [ connectionStatus, introMessage, dispatch, geoLocation ] );

	// notify parent window about chat status changes
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
				dispatch( sendEvent( 'Minimized HelpCenter' ) );
				break;

			case 'maximized':
				setBlurredAt( 0 );
				dispatch( sendEvent( 'Maximized HelpCenter' ) );
				break;

			case 'hidden':
				setBlurredAt( Date.now() );
				dispatch( sendEvent( 'Stopped looking at HelpCenter' ) );
				break;

			case 'open':
				setBlurredAt( 0 );
				dispatch( sendEvent( 'Started looking at HelpCenter' ) );
				break;

			case 'closed':
				dispatch( sendEvent( 'Closed HelpCenter' ) );
				dispatch( closeChat() );
		}
	}, [ dispatch, windowState ] );

	useEffect( () => {
		function closeHandler() {
			parentTarget?.postMessage(
				{
					type: 'window-state-change',
					state: 'closed',
				},
				'*'
			);
		}
		window.addEventListener( 'beforeunload', closeHandler );

		// request intro data
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
			<HappychatConnection getAuth={ () => Promise.resolve( auth ) } />
			<ParentConnection
				connectionStatus={ connectionStatus }
				timeline={ timeline }
				chatStatus={ chatStatus }
				geoLocation={ auth.user.geoLocation }
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
