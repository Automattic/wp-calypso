import { useEffect } from 'react';
import type { WindowState } from './types';

export function useHCWindowCommunicator(
	onStateChange: ( state: WindowState ) => void,
	onUnreadChange: ( unreadCount: number ) => void
) {
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
						if ( data.state === 'closed' ) {
							// cleanup
							window.removeEventListener( 'message', messageHandler );
						}
						break;
				}
			}
		};

		window.addEventListener( 'message', messageHandler, false );
		return () => {
			window.removeEventListener( 'message', messageHandler, false );
		};
	}, [ onStateChange, onUnreadChange ] );
}
