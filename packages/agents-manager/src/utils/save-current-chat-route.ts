import { select } from '@wordpress/data';
import { AGENTS_MANAGER_STORE } from '../stores';
import { persistAgentsManagerState } from './persist-agents-manager-state';
import type { AgentsManagerSelect } from '@automattic/data-stores';

/**
 * Saves the current `/chat` route with the session ID to the server,
 * so the last conversation can be restored on page load.
 */
export function saveCurrentChatRoute( sessionId: string ): void {
	const current = ( select( AGENTS_MANAGER_STORE ) as AgentsManagerSelect ).getRouterHistory();

	const entry = {
		pathname: '/chat',
		search: '',
		hash: '',
		key: crypto.randomUUID(),
		state: { sessionId },
	};

	// Clone the existing history stack, or start empty if none exists yet.
	// Then replace the entry at the current index with the new chat route.
	const entries = current?.entries?.length ? [ ...current.entries ] : [];
	const index = current?.index ?? 0;
	entries[ index ] = entry;

	persistAgentsManagerState( { agents_manager_router_history: { entries, index } } );
}
