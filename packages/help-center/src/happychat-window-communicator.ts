import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { SITE_STORE } from './components/help-center-contact-form';
import { STORE_KEY } from './store';
import type { WindowState } from './types';

export function useHCWindowCommunicator(
	onStateChange: ( state: WindowState ) => void,
	onUnreadChange: ( unreadCount: number ) => void
) {
	const { siteId, subject, message, otherSiteURL } = useSelect( ( select ) => {
		return {
			siteId: select( STORE_KEY ).getSiteId(),
			subject: select( STORE_KEY ).getSubject(),
			message: select( STORE_KEY ).getMessage(),
			otherSiteURL: select( STORE_KEY ).getOtherSiteURL(),
		};
	} );
	const { resetPopup } = useDispatch( STORE_KEY );

	const planSlug = useSelect(
		( select ) =>
			( siteId && select( SITE_STORE ).getSite( siteId )?.plan?.product_slug ) || 'Unknown plan'
	);

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
								siteId,
								subject,
								message,
								planSlug,
								otherSiteURL,
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
	}, [ onStateChange, onUnreadChange, siteId, subject, message, otherSiteURL, planSlug ] );
}
