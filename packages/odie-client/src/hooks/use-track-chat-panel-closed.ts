import { useRegistry } from '@wordpress/data';
import { useEffect, useRef } from 'react';
import { HELP_CENTER_STORE } from '../constants';
import { useOdieAssistantContext } from '../context';
import { getChatState } from '../utils/get-chat-state';
import { useIsPendingDirectChat } from './use-is-pending-direct-chat';
import type { HelpCenterSelect } from '@automattic/data-stores';

/**
 * Records `chat_panel_closed`, with the chat's state, when the user closes the Help Center on a
 * chat, so closing it while waiting for a person can be counted. The chat unmounts both when the
 * panel closes and when the user moves to another Help Center page, so it only counts once the
 * panel is no longer shown.
 */
export function useTrackChatPanelClosed() {
	const { chat, trackEvent } = useOdieAssistantContext();
	const isPendingDirectChat = useIsPendingDirectChat();
	const registry = useRegistry();
	const latest = useRef( { chat, trackEvent, isPendingDirectChat } );
	latest.current = { chat, trackEvent, isPendingDirectChat };

	useEffect(
		() => () => {
			if ( ( registry.select( HELP_CENTER_STORE ) as HelpCenterSelect ).isHelpCenterShown() ) {
				return;
			}

			// Read at unmount: the chat as it was when the panel closed.
			const state = latest.current;
			state.trackEvent( 'chat_panel_closed', {
				chat_state: getChatState( state.chat, state.isPendingDirectChat ),
				conversation_id: state.chat.conversationId ?? null,
			} );
		},
		[ registry ]
	);
}
