import { useCallback } from 'react';
import type { MutableRefObject } from 'react';
import { getAgentManager } from './agentManager';
import type { Message as ClientMessage } from '../client/types/index';
import { logger } from '../client/utils/logger';
import {
	canRegenerateAgentMessage,
	getLatestRegeneratableAgentMessageId,
	getRegenerateRequest,
} from './regenerate';
import type {
	AgentChatState,
	InternalSubmitOptions,
	SubmitOptions,
	UIMessage,
} from './useAgentChat';

// The subset of `useAgentChat`'s send function that regenerate relies on:
// the same signature, including the internal options used to rewind history
// and restore on error.
type SendMessage = (
	message: string,
	options?: SubmitOptions,
	internalOptions?: InternalSubmitOptions
) => Promise< void >;

interface UseRegenerateParams {
	agentId: string;
	isValidConfig: boolean;
	// Guards against starting a regenerate while another send is in flight.
	isSendingRef: MutableRefObject< boolean >;
	// Latest chat state, read without re-creating the callbacks each render.
	stateRef: MutableRefObject< AgentChatState >;
	transformMessages: ( messages: ClientMessage[] ) => UIMessage[];
	sendMessage: SendMessage;
}

interface UseRegenerateReturn {
	// Returns a handler that regenerates the given agent message (or the latest
	// eligible one when no message is passed), or `null` when regenerate is not
	// available — so callers can both gate the UI and trigger the action.
	getRegenerateHandler: (
		message?: UIMessage
	) => ( () => Promise< void > ) | null;
}

/**
 * Regenerate behavior for the agent chat, extracted from `useAgentChat`.
 *
 * Rewinds the conversation to the history that preceded a chosen agent
 * response, re-sends the originating user message, and restores the prior
 * state if the new send fails.
 *
 * @param root0                   - Dependencies supplied by `useAgentChat`
 * @param root0.agentId           - Identifier of the active agent
 * @param root0.isValidConfig     - Whether the agent configuration is valid
 * @param root0.isSendingRef      - Ref guarding against concurrent sends
 * @param root0.stateRef          - Ref holding the latest chat state
 * @param root0.transformMessages - Converts client messages to UI messages
 * @param root0.sendMessage       - The hook's guarded send function
 * @return Regenerate handler accessor for the chat
 */
export function useRegenerate( {
	agentId,
	isValidConfig,
	isSendingRef,
	stateRef,
	transformMessages,
	sendMessage,
}: UseRegenerateParams ): UseRegenerateReturn {
	const handleRegenerateActionClick = useCallback(
		async ( message?: UIMessage ) => {
			if ( ! isValidConfig || isSendingRef.current ) {
				return;
			}

			const agentManager = getAgentManager();
			const currentClientMessages =
				agentManager.getConversationHistory( agentId );
			const agentMessageId =
				message?.id ??
				getLatestRegeneratableAgentMessageId( currentClientMessages );

			if ( ! agentMessageId ) {
				return;
			}

			const regenerateRequest = getRegenerateRequest(
				currentClientMessages,
				agentMessageId
			);

			if ( ! regenerateRequest ) {
				return;
			}

			const restoreOnError = {
				clientMessages: currentClientMessages,
				uiMessages: stateRef.current.uiMessages,
			};
			const initialUiMessages = transformMessages(
				regenerateRequest.baseHistory
			);

			// sendMessage re-throws on failure, but restoreOnError has already
			// reverted the conversation and surfaced the error in state. Swallow
			// it so the click handler doesn't reject unhandled.
			try {
				await sendMessage( regenerateRequest.prompt, undefined, {
					initialClientMessages: [
						...regenerateRequest.baseHistory,
						regenerateRequest.userMessage,
					],
					initialUiMessages,
					messageOverride: regenerateRequest.userMessage,
					preserveUiOnlyMessages: false,
					truncateHistoryTo: regenerateRequest.baseHistory,
					restoreOnError,
				} );
			} catch ( error ) {
				logger( 'Regenerate failed; conversation restored', error );
			}
		},
		[
			agentId,
			isSendingRef,
			isValidConfig,
			sendMessage,
			stateRef,
			transformMessages,
		]
	);

	const getRegenerateHandler = useCallback(
		( message?: UIMessage ): ( () => Promise< void > ) | null => {
			const currentState = stateRef.current;
			const agentManager = getAgentManager();
			const currentClientMessages = agentManager.hasAgent( agentId )
				? agentManager.getConversationHistory( agentId )
				: currentState.clientMessages;
			const agentMessageId =
				message?.id ??
				getLatestRegeneratableAgentMessageId( currentClientMessages );

			if (
				! isValidConfig ||
				( message && message.role !== 'agent' ) ||
				! agentMessageId ||
				! canRegenerateAgentMessage(
					currentClientMessages,
					agentMessageId
				)
			) {
				return null;
			}

			return () => handleRegenerateActionClick( message );
		},
		[ agentId, handleRegenerateActionClick, isValidConfig, stateRef ]
	);

	return { getRegenerateHandler };
}
