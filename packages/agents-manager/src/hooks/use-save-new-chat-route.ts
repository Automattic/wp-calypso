import { select } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { useLocation } from 'react-router-dom';
import { useAgentsManagerContext } from '../contexts';
import { AGENTS_MANAGER_STORE } from '../stores';
import { getSessionId } from '../utils/agent-session';
import { persistAgentsManagerState } from '../utils/persist-agents-manager-state';
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
 * Polls `localStorage` for the session ID (written by `agenttic-client` after the first AI reply),
 * then saves the chat route so the conversation can be resumed later.
 */
export default function useSaveNewChatRoute() {
	const { agentConfig, siteKey } = useAgentsManagerContext();
	const { pathname, state } = useLocation();

	useEffect( () => {
		if ( pathname !== '/chat' || state?.sessionId ) {
			return;
		}

		const intervalId = setInterval( () => {
			const sessionId = getSessionId( agentConfig?.agentId );

			if ( sessionId ) {
				saveNewChatRoute( sessionId, siteKey );
				clearInterval( intervalId );
			}
		}, 500 );

		return () => clearInterval( intervalId );
	}, [ agentConfig?.agentId, pathname, siteKey, state?.sessionId ] );
}
