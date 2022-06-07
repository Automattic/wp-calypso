import { useHappychatAuth } from '@automattic/happychat-connection';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { STORE_KEY } from './store';
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
			selectedSite: select( STORE_KEY ).getSite(),
			userDeclaredSite: select( STORE_KEY ).getUserDeclaredSite(),
			subject: select( STORE_KEY ).getSubject(),
			message: select( STORE_KEY ).getMessage(),
		};
	} );

	const currentSite = useSelect( ( select ) =>
		select( 'automattic/site' ).getSite( window._currentSiteId )
	);

	const supportSite = selectedSite || userDeclaredSite || currentSite;
	const { resetStore } = useDispatch( STORE_KEY );
	const auth = useHappychatAuth();

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
						event.source?.postMessage(
							{
								type: 'happy-chat-authentication-data',
								authData: auth?.data,
							},
							{ targetOrigin: event.origin }
						);
						break;
					}
				}
			}
		};

		window.addEventListener( 'message', messageHandler, false );
		return () => {
			window.removeEventListener( 'message', messageHandler, false );
		};
	}, [ onStateChange, onUnreadChange, supportSite, subject, message, auth, resetStore ] );
}
