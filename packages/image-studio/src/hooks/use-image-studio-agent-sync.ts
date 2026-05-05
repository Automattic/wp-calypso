import { useDispatch } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import { type ImageStudioActions, store as imageStudioStore } from '../store';
import { ImageStudioMode } from '../types';
import { getToolErrorCategory, isWpErrorShape } from '../utils/error-categories';
import { trackImageStudioError } from '../utils/tracking';

interface AgentMessagePart {
	type?: string;
	data?: { result?: unknown };
}

interface AgentMessage {
	id?: string;
	messageId?: string;
	role?: string;
	parts?: AgentMessagePart[];
}

/**
 * Keeps Image Studio store in sync with Agent chat state.
 *
 * - Updates AI processing status when agent is processing.
 * - Tracks the last agent message ID for feedback.
 * - Surfaces structured tool errors (WP_Error returns from server-side
 *   abilities) as notices, mapping codes to user-facing copy via
 *   `getToolErrorCategory`. Without this the LLM paraphrases errors into
 *   vague chat replies, hiding the actual cause from the user.
 * @param agentChatProps
 * @param agentChatProps.isProcessing
 * @param agentChatProps.messages
 * @param agentChatProps.error
 */
export function useImageStudioAgentSync( agentChatProps: {
	isProcessing?: boolean;
	messages?: Array< AgentMessage >;
	error?: string | null;
} ) {
	const { isProcessing, messages, error } = agentChatProps || {};
	const lastTrackedMessageId = useRef< string | null >( null );
	const surfacedErrorMessageIds = useRef< Set< string > >( new Set() );
	const lastSurfacedAgentError = useRef< string | null >( null );

	const { setImageStudioAiProcessing, setLastAgentMessageId, addNotice } = useDispatch(
		imageStudioStore
	) as ImageStudioActions;

	// Sync processing state
	useEffect( () => {
		setImageStudioAiProcessing( {
			source: 'agent',
			value: isProcessing || false,
		} );
	}, [ isProcessing, setImageStudioAiProcessing ] );

	// Track the last agent message ID for feedback
	useEffect( () => {
		if ( ! messages?.length ) {
			return;
		}

		// Find the last agent message without creating a reversed copy
		let lastAgentMessage: AgentMessage | undefined;
		for ( let i = messages.length - 1; i >= 0; i-- ) {
			if ( messages[ i ].role === 'agent' ) {
				lastAgentMessage = messages[ i ];
				break;
			}
		}

		const lastAgentMessageId = lastAgentMessage?.id ?? lastAgentMessage?.messageId;
		if ( lastAgentMessageId && lastAgentMessageId !== lastTrackedMessageId.current ) {
			lastTrackedMessageId.current = lastAgentMessageId;
			setLastAgentMessageId( lastAgentMessageId );
		}
	}, [ messages, setLastAgentMessageId ] );

	// Surface structured tool errors as notices
	useEffect( () => {
		if ( ! messages?.length ) {
			return;
		}

		for ( const message of messages ) {
			const messageKey = message.id ?? message.messageId;
			if ( ! messageKey || surfacedErrorMessageIds.current.has( messageKey ) ) {
				continue;
			}

			for ( const part of message.parts ?? [] ) {
				if ( part?.type !== 'data' ) {
					continue;
				}
				const result = part.data?.result;
				if ( ! isWpErrorShape( result ) ) {
					continue;
				}
				const category = getToolErrorCategory( result.code );
				if ( ! category ) {
					continue;
				}

				addNotice( category.userMessage, category.severity );
				trackImageStudioError( {
					mode: ImageStudioMode.Generate,
					errorType: category.errorType,
				} );
				surfacedErrorMessageIds.current.add( messageKey );
				break;
			}
		}
	}, [ messages, addNotice ] );

	// Surface JSON-RPC envelope errors from the agent server. The orchestrator
	// emits a redacted "An error occurred…" string when it fails before any
	// tool runs (tool failures come through the structured-error path above).
	// Without this, the only signal users get is the agent posting that string
	// as a chat reply, with no notice and no tracking.
	useEffect( () => {
		if ( ! error ) {
			lastSurfacedAgentError.current = null;
			return;
		}
		if ( error === lastSurfacedAgentError.current ) {
			return;
		}
		lastSurfacedAgentError.current = error;
		addNotice( error, 'error' );
		trackImageStudioError( {
			mode: ImageStudioMode.Generate,
			errorType: 'other',
		} );
	}, [ error, addNotice ] );
}
