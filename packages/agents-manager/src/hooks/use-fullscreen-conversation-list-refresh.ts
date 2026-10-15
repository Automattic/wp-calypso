import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from '@wordpress/element';
import { AGENT_TURN_ENDED_EVENT } from '../utils/agent-activity-events';
import { AGENT_SESSION_CHANGED_EVENT } from '../utils/agent-session';

const CONVERSATION_LIST_QUERY_KEY = [ 'agents-manager-conversation-list' ];

/**
 * Keeps the always-visible full-screen history current after a conversation
 * becomes listable or receives another completed turn.
 */
export function useFullscreenConversationListRefresh(): void {
	const queryClient = useQueryClient();

	useEffect( () => {
		const refresh = () => {
			void queryClient.invalidateQueries( { queryKey: CONVERSATION_LIST_QUERY_KEY } );
		};

		window.addEventListener( AGENT_TURN_ENDED_EVENT, refresh );
		window.addEventListener( AGENT_SESSION_CHANGED_EVENT, refresh );

		return () => {
			window.removeEventListener( AGENT_TURN_ENDED_EVENT, refresh );
			window.removeEventListener( AGENT_SESSION_CHANGED_EVENT, refresh );
		};
	}, [ queryClient ] );
}
