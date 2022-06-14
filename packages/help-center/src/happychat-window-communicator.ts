/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { useHappychatAuth } from '@automattic/happychat-connection';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
/**
 * Internal Dependencies
 */
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

	const siteId = useSelector( getSelectedSiteId );
	const currentSite = useSelect( ( select ) => select( SITE_STORE ).getSite( siteId ), [ siteId ] );

	const queryClient = useQueryClient();

	const supportSite = selectedSite || userDeclaredSite || currentSite;
	const { resetStore } = useDispatch( HELP_CENTER_STORE );
	useHappychatAuth();

	useEffect( () => {
		const messageHandler = ( event: MessageEvent ) => {
			// please be careful about changing this check
			// sometimes we send sensitive information to this event's origin,
			// and changing this to something untrusted is a serious security risk.
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
						// this hooks up to the query initiated above (useHappychatAuth)
						// and returns a promise. We wait for this promise to prevent a race-condition.
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
			}
		};

		window.addEventListener( 'message', messageHandler );

		return () => {
			window.removeEventListener( 'message', messageHandler );
		};
	}, [ onStateChange, onUnreadChange, queryClient, supportSite, subject, message, resetStore ] );
}
