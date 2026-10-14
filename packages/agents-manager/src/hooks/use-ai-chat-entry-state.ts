import { useSelect } from '@wordpress/data';
import { AGENTS_MANAGER_STORE } from '../stores';
import { DEFAULT_DESKTOP_MEDIA_QUERY, useCanDock } from '../utils/can-dock';
import { getChatPresentation } from '../utils/chat-presentation';
import type { AgentsManagerSelect } from '@automattic/data-stores';

/**
 * The chat state the AI chat entry buttons render from: whether the persisted
 * state has loaded and whether the chat is showing.
 */
export function useAiChatEntryState(): { hasLoaded: boolean; isChatVisible: boolean } {
	// A locked chat can be closed where it cannot dock, so re-read on that change.
	const { canDock } = useCanDock( { desktopMediaQuery: DEFAULT_DESKTOP_MEDIA_QUERY } );

	return useSelect(
		( select ) => {
			const store = select( AGENTS_MANAGER_STORE ) as AgentsManagerSelect;
			const { hasLoaded, isChatVisible } = store.getAgentsManagerState();

			return { hasLoaded, isChatVisible: isChatVisible || ! getChatPresentation().dismissible };
		},
		[ canDock ]
	);
}
