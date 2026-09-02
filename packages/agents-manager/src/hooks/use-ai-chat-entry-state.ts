import { useSelect } from '@wordpress/data';
import { AGENTS_MANAGER_STORE } from '../stores';
import type { AgentsManagerSelect } from '@automattic/data-stores';

/**
 * Chat state shared by the AI chat entry buttons. The "Agent" label waits for
 * the persisted state to load so it can't flash beside a chat that is about to
 * restore open.
 */
export function useAiChatEntryState(): { isChatVisible: boolean; isLabelVisible: boolean } {
	return useSelect( ( select ) => {
		const store = select( AGENTS_MANAGER_STORE ) as AgentsManagerSelect;
		const { hasLoaded, isChatVisible } = store.getAgentsManagerState();

		return { isChatVisible, isLabelVisible: hasLoaded && ! isChatVisible };
	}, [] );
}
