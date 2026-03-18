import { select } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import { useLocation } from 'react-router-dom';
import { useAgentsManagerContext } from '../contexts';
import { AGENTS_MANAGER_STORE } from '../stores';
import { getSessionId } from '../utils/agent-session';
import { persistAgentsManagerState } from '../utils/persist-agents-manager-state';
import type { UIMessage } from '@automattic/agenttic-client';
import type { AgentsManagerSelect } from '@automattic/data-stores';

/**
 * Saves the chat route so the conversation can be restored later.
 */
function saveNewChatRoute( sessionId: string, siteKey: string ): void {
	const store = select( AGENTS_MANAGER_STORE ) as AgentsManagerSelect;
	const current = store.getRouterHistory( siteKey );

	const entry = {
		pathname: '/chat',
		search: '',
		hash: '',
		key: crypto.randomUUID(),
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
 * Waits for the first AI reply (which creates the session ID),
 * then saves the chat route so the conversation can be resumed later.
 */
export default function useSaveNewChatRoute( messages: UIMessage[] ) {
	const { agentConfig, siteKey } = useAgentsManagerContext();

	const sessionId = getSessionId( agentConfig?.agentId ?? '' );
	const prevSessionIdRef = useRef< string >( sessionId );
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

		// Save the route only when the session ID changes.
		if ( sessionId && sessionId !== prevSessionIdRef.current ) {
			saveNewChatRoute( sessionId, siteKey );
			prevSessionIdRef.current = sessionId;
		}
	}, [ messages, pathname, sessionId, siteKey, state?.sessionId ] );
}
