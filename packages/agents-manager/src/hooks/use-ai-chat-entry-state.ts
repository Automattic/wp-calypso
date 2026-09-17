import { useSelect } from '@wordpress/data';
import { AGENTS_MANAGER_STORE } from '../stores';
import type { AgentsManagerSelect } from '@automattic/data-stores';

/**
 * The chat state the AI chat entry buttons render from: whether the persisted
 * state has loaded and whether the chat is showing.
 */
export function useAiChatEntryState(): { hasLoaded: boolean; isChatVisible: boolean } {
	return useSelect( ( select ) => {
		const store = select( AGENTS_MANAGER_STORE ) as AgentsManagerSelect;
		const { hasLoaded, isChatVisible } = store.getAgentsManagerState();

		return { hasLoaded, isChatVisible };
	}, [] );
}
