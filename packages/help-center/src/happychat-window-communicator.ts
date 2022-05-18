import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { STORE_KEY } from './store';
import type { WindowState } from './types';

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

	const supportSite = selectedSite || userDeclaredSite;
	const { resetPopup, resetStore } = useDispatch( STORE_KEY );

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
							resetPopup();
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
						// now clear the store, since we sent everything
						resetStore();
						break;
					}
				}
			}
		};

		window.addEventListener( 'message', messageHandler, false );
		return () => {
			window.removeEventListener( 'message', messageHandler, false );
		};
	}, [ onStateChange, onUnreadChange, supportSite, subject, message, resetPopup ] );
}
