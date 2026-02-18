import { select } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import { useLocation } from 'react-router-dom';
import { AGENTS_MANAGER_STORE } from '../stores';
import { getSessionId } from '../utils/agent-session';
import { persistAgentsManagerState } from '../utils/persist-agents-manager-state';
import type { UIMessage } from '@automattic/agenttic-client';
import type { AgentsManagerSelect } from '@automattic/data-stores';

/**
 * Saves the chat route so the conversation can be restored later.
 */
function saveNewChatRoute( sessionId: string ): void {
	const current = ( select( AGENTS_MANAGER_STORE ) as AgentsManagerSelect ).getRouterHistory();

	const entry = {
		pathname: '/chat',
		search: '',
		hash: '',
		key: crypto.randomUUID(),
		state: { sessionId },
	};

	// Update the history with the new chat entry.
	const entries = current?.entries?.length ? [ ...current.entries ] : [];
	const index = current?.index ?? 0;
	entries[ index ] = entry;

	persistAgentsManagerState( { agents_manager_router_history: { entries, index } } );
}

/**
 * Waits for the first AI reply (which creates the session ID),
 * then saves the chat route so it can be restored later.
 */
export default function useSaveNewChatRoute( agentId: string, messages: UIMessage[] ) {
	const prevSessionIdRef = useRef< string >( '' );
	const { pathname, state } = useLocation();

	useEffect( () => {
		if ( pathname !== '/chat' || state?.sessionId ) {
			return;
		}

		// The session ID only exists after the AI agent has replied.
		const hasServerMessage = messages.some( ( message ) => message.role === 'agent' );

		if ( ! hasServerMessage ) {
			return;
		}

		const sessionId = getSessionId( agentId );

		// Save the route only when the session ID changes.
		if ( sessionId !== prevSessionIdRef.current ) {
			saveNewChatRoute( sessionId );
			prevSessionIdRef.current = sessionId;
		}
	}, [ agentId, messages, pathname, state?.sessionId ] );
}
