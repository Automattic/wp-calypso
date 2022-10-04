/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { useHappychatAuth } from '@automattic/happychat-connection';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
/**
 * Internal Dependencies
 */
import { HELP_CENTER_STORE, SITE_STORE } from './stores';

/**
 * This hook is the bridge between HappyChat and Help Center.
 * It attaches an event listener for messages that com from https://widgets.wp.com and sends messages to the iframe that holds the HappyChat window.
 * This helps us manage window state, chat status, and unread count.
 *
 * @param {boolean} isMinimized if Help Center is minimized this is true
 * @returns {{unreadCount: number, chatStatus: string, closeChat: Function}}
 */

export function useHCWindowCommunicator( isMinimized: boolean ) {
	const { selectedSite, subject, message, userDeclaredSite, iframe } = useSelect( ( select ) => {
		return {
			selectedSite: select( HELP_CENTER_STORE ).getSite(),
			userDeclaredSite: select( HELP_CENTER_STORE ).getUserDeclaredSite(),
			subject: select( HELP_CENTER_STORE ).getSubject(),
			message: select( HELP_CENTER_STORE ).getMessage(),
			iframe: select( HELP_CENTER_STORE ).getIframe(),
		};
	} );
	const queryClient = useQueryClient();
	const [ unreadCount, setUnreadCount ] = useState( 0 );
	const [ chatStatus, setChatStatus ] = useState( '' );
	const siteId = useSelector( getSelectedSiteId );
	const currentSite = useSelect( ( select ) => select( SITE_STORE ).getSite( siteId ), [ siteId ] );
	const chatWindow = iframe?.contentWindow;
	function happyChatPostMessage( message: Record< string, string > ) {
		chatWindow?.postMessage( message, '*' );
	}

	const supportSite = selectedSite || userDeclaredSite || currentSite;
	const { resetStore } = useDispatch( HELP_CENTER_STORE );
	useHappychatAuth();

	useEffect( () => {
		isMinimized
			? happyChatPostMessage( { type: 'window-state-change', state: 'minimized' } )
			: happyChatPostMessage( { type: 'window-state-change', state: 'maximized' } );
	}, [ chatWindow, isMinimized ] );

	const closeChat = () => {
		setChatStatus( '' );
		setUnreadCount( 0 );
		happyChatPostMessage( { type: 'window-state-change', state: 'closed' } );
	};

	useEffect( () => {
		const messageHandler = ( event: MessageEvent ) => {
			// please be careful about changing this check
			// sometimes we send sensitive information to this event's origin,
			// and changing this to something untrusted is a serious security risk.
			if ( event.origin === 'https://widgets.wp.com' ) {
				const { data } = event;
				switch ( data.type ) {
					case 'calypso-happy-chat-unread-messages':
						setUnreadCount( data.state );
						break;

					case 'window-state-change':
						setChatStatus( data.state );
						if ( data.state === 'ended' ) {
							setChatStatus( '' );
							setUnreadCount( 0 );
							window.removeEventListener( 'message', messageHandler );
							resetStore();
						}
						break;

					case 'happy-chat-introduction-data':
						if ( message ) {
							event.source?.postMessage(
								{
									type: 'happy-chat-introduction-data',
									siteId: supportSite?.ID.toString(),
									subject,
									message,
									planSlug: supportSite?.plan?.product_slug,
									siteUrl: supportSite?.URL,
								},
								{ targetOrigin: event.origin }
							);
						}
						resetStore();
						break;

					case 'happy-chat-authentication-data':
						queryClient.fetchQuery( 'getHappychatAuth' ).then( ( auth ) => {
							event.source?.postMessage(
								{
									type: 'happy-chat-authentication-data',
									authData: auth,
								},
								{ targetOrigin: event.origin }
							);
						} );
						break;
				}
			}
		};

		window.addEventListener( 'message', messageHandler );

		return () => {
			window.removeEventListener( 'message', messageHandler );
		};
	}, [ queryClient, supportSite, subject, message, resetStore ] );

	return { unreadCount, chatStatus, closeChat };
}
