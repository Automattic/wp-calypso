import {
	getAgentManager,
	type Message,
	type UseAgentChatReturn,
} from '@automattic/agenttic-client';
import { useAgentsManagerContext } from '../contexts';
import useConversation from './use-conversation';

interface UseConversationHydrationOptions {
	/** A `wp-admin-navigate` resume is pending; its history must not be replaced. */
	hadParkedNavigation: boolean;
	loadMessages: UseAgentChatReturn[ 'loadMessages' ];
	/** Called with the fetched transcript, even when the live history is kept instead. */
	onFetch: ( loadedMessages: Message[] ) => void;
}

/**
 * Loads the saved conversation from the server and fills the chat with it,
 * unless the chat already holds a newer history: a pending navigation resume,
 * or a turn still running after a remount. `useConversation` skips Reader
 * Chat, which has no server history.
 *
 * Returns whether the conversation is still loading.
 */
export function useConversationHydration( {
	hadParkedNavigation,
	loadMessages,
	onFetch,
}: UseConversationHydrationOptions ) {
	const { agentConfig } = useAgentsManagerContext();

	const { isLoading } = useConversation( {
		onSuccess: ( loadedMessages, serverSessionId ) => {
			const agentId = agentConfig!.agentId;

			// The agent may have been discarded (e.g. a site switch) while this
			// fetch was in flight — its result belongs to the previous scope.
			const agentManager = getAgentManager();
			if ( ! agentManager.hasAgent( agentId ) ) {
				return;
			}

			onFetch( loadedMessages );

			// Keep the live history while a turn is in flight: a remount mid-turn
			// (History and back, reopening the panel) fetches a transcript without
			// the reply yet. With a resume pending, the tab's store holds the parked
			// call's conversation, so hydrate only if its restore came up empty
			// (e.g. a quota-failed persist). Read the manager, not React state:
			// `messages` stays empty until the async agent init lands.
			const hasNewerLiveHistory =
				agentManager.isTurnInFlight( agentId ) ||
				( hadParkedNavigation && agentManager.getConversationHistory( agentId ).length > 0 );
			if ( ! hasNewerLiveHistory ) {
				loadMessages( loadedMessages );
			}

			agentManager.updateSessionId( agentId, serverSessionId );

			// Save the server's session ID as this tab's session through the
			// config's callback, so it writes under the site the config was
			// created for.
			if ( agentConfig!.sessionId !== serverSessionId ) {
				agentConfig!.onSessionIdChange?.( serverSessionId );
			}
		},
	} );

	return isLoading;
}
