import { select } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { useLocation } from 'react-router-dom';
import { useAgentsManagerContext } from '../contexts';
import { AGENTS_MANAGER_STORE, persistAgentsManagerState } from '../stores';
import { getSessionId } from '../utils/agent-session';
import { generateUUID } from '../utils/generate-uuid';
import type { AgentsManagerSelect } from '@automattic/data-stores';

/**
 * Saves the chat route so the conversation can be restored later.
 */
function saveNewChatRoute( sessionId: string, siteKey: string ): void {
	const store = select( AGENTS_MANAGER_STORE ) as unknown as AgentsManagerSelect;
	const current = store.getRouterHistory( siteKey );

	const entry = {
		pathname: '/chat',
		search: '',
		hash: '',
		key: generateUUID(),
		state: { sessionId },
	};

	// Replace the current history entry with the new chat route.
	const entries = current?.entries?.length ? [ ...current.entries ] : [];
	const index = current?.index ?? 0;
	entries[ index ] = entry;

	const fullMap = store.getAgentsManagerState().routerHistory || {};
	persistAgentsManagerState( {
		agents_manager_router_history: { ...fullMap, [ siteKey ]: { entries, index } },
	} );
}

/**
 * When the user sends a message in a new chat, polls for the session ID and saves
 * the chat route so the conversation can be restored later.
 */
export default function useSaveNewChatRoute( hasUserSentMessage: boolean ) {
	const { agentConfig, siteKey } = useAgentsManagerContext();
	const { pathname, state } = useLocation();

	useEffect( () => {
		if ( pathname !== '/chat' || state?.sessionId || ! hasUserSentMessage ) {
			return;
		}

		let attempts = 0;
		const MAX_ATTEMPTS = 120; // Stop after 60 seconds (120 × 500ms)

		const intervalId = setInterval( () => {
			if ( attempts >= MAX_ATTEMPTS ) {
				clearInterval( intervalId );
				return;
			}

			const sessionId = getSessionId( agentConfig?.agentId );

			if ( sessionId ) {
				saveNewChatRoute( sessionId, siteKey );
				clearInterval( intervalId );
			}

			attempts++;
		}, 500 );

		return () => clearInterval( intervalId );
	}, [ agentConfig?.agentId, hasUserSentMessage, pathname, siteKey, state?.sessionId ] );
}
