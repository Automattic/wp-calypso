import { requestHappyChatAuth } from '@automattic/happychat-connection';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { HELP_CENTER_STORE, SITE_STORE } from './stores';
import type { WindowState } from './types';
/**
 * This hook attaches an event listener to the window to listen to Happychat messages that com from https://widgets.wp.com/calypso-happychat/
 * It collects information from the help-center store and forwards it to Happychat. It also forwards the unread count and the state changes (ended, blurred, closed, opened) to whoever uses the hook
 *
 * @param onStateChange a callback that will be called whenever state changes
 * @param onUnreadChange a callback that will be called with the number of new unread messages
 */
export function useHCWindowCommunicator(
	onStateChange: ( state: WindowState ) => void,
	onUnreadChange: ( unreadCount: number ) => void
) {
	const { selectedSite, subject, message, userDeclaredSite } = useSelect( ( select ) => {
		return {
			selectedSite: select( HELP_CENTER_STORE ).getSite(),
			userDeclaredSite: select( HELP_CENTER_STORE ).getUserDeclaredSite(),
			subject: select( HELP_CENTER_STORE ).getSubject(),
			message: select( HELP_CENTER_STORE ).getMessage(),
		};
	} );

	const currentSite = useSelect( ( select ) =>
		select( SITE_STORE ).getSite( window._currentSiteId )
	);

	const supportSite = selectedSite || userDeclaredSite || currentSite;
	const { resetStore } = useDispatch( HELP_CENTER_STORE );

	useEffect( () => {
		const messageHandler = ( event: MessageEvent ) => {
			if ( event.origin === 'https://widgets.wp.com' ) {
				const { data } = event;
				switch ( data.type ) {
					case 'calypso-happy-chat-unread-messages':
						onUnreadChange( data.state );
						break;
					case 'window-state-change':
						onStateChange( data.state );
						if ( data.state === 'ended' ) {
							// cleanup
							window.removeEventListener( 'message', messageHandler );
							// now clear the store, since we sent everything
							resetStore();
						}
						break;
					case 'happy-chat-introduction-data': {
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

						break;
					}
					case 'happy-chat-authentication-data': {
						requestHappyChatAuth().then( ( auth ) => {
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
			}
		};

		window.addEventListener( 'message', messageHandler );

		return () => {
			window.removeEventListener( 'message', messageHandler );
		};
	}, [ onStateChange, onUnreadChange, supportSite, subject, message, resetStore ] );
}
