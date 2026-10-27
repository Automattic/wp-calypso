import {
	getAgentManager,
	type Message,
	type ToolResultInput,
	type TurnToolCall,
	type UseAgentChatReturn,
} from '@automattic/agenttic-client';
import { useAgentsManagerContext } from '../contexts';
import { hasNewAgentReply } from '../utils/tool-call-resume';
import useConversation from './use-conversation';

interface UseConversationHydrationOptions {
	/** A `wp-admin-navigate` resume is pending; its history must not be replaced. */
	hadParkedNavigation: boolean;
	loadMessages: UseAgentChatReturn[ 'loadMessages' ];
	/** Called with the fetched transcript, even when the live history is kept instead. */
	onFetch: ( loadedMessages: Message[] ) => void;
	/** Called right before the fetched transcript replaces the chat's. */
	onHistoryLoad: () => void;
	/** Whether a turn is running; a running turn ends the wait for a reply. */
	isProcessing: boolean;
	/** Called with the unanswered question when the user picks Retry. */
	onRetry: ( question: string ) => void;
	/** Sends the tool results that resume a turn paused before a page change. */
	onSubmit: UseAgentChatReturn[ 'onSubmit' ];
}

/**
 * Loads the saved conversation from the server and fills the chat with it,
 * unless the chat already holds a newer history: a pending navigation resume,
 * or a turn still running after a remount. `useConversation` skips Reader
 * Chat, which has no server history.
 *
 * A turn paused on a browser tool whose page went away has no one left to
 * answer it, so this page answers it and the reply streams in here.
 *
 * Returns whether the conversation is still loading, the notice to show while
 * it waits for, picks up or gives up on a reply a page change left unanswered,
 * and whether a resume failed (`hasFailedResume`).
 */
export function useConversationHydration( {
	hadParkedNavigation,
	loadMessages,
	onFetch,
	onHistoryLoad,
	isProcessing,
	onRetry,
	onSubmit,
}: UseConversationHydrationOptions ) {
	const { agentConfig } = useAgentsManagerContext();

	// Answers the browser tool calls a turn paused on before a page change, so the
	// reply streams in here; resolves to whether one did.
	async function resumeToolCalls( toolResults: ToolResultInput[], turnToolCalls: TurnToolCall[] ) {
		const agentManager = getAgentManager();
		const agentId = agentConfig!.agentId;
		const messageIdsBeforeResume = new Set(
			agentManager.getConversationHistory( agentId ).map( ( { messageId } ) => messageId )
		);

		await onSubmit( '', { type: 'tool_results', toolResults, turnToolCalls } );

		return hasNewAgentReply(
			messageIdsBeforeResume,
			agentManager.getConversationHistory( agentId )
		);
	}

	const { isLoading, notice, hasFailedResume } = useConversation( {
		waitForReply: ! isProcessing,
		onRetry,
		onResume: resumeToolCalls,
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
				onHistoryLoad();
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

	return { isLoading, notice, hasFailedResume };
}
