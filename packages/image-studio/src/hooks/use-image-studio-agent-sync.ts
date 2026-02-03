import { useDispatch } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import { type ImageStudioActions, store as imageStudioStore } from '../store';

interface AgentMessage {
	id: string;
	role: string;
}

/**
 * Keeps Image Studio store in sync with Agent chat state.
 *
 * - Updates AI processing status when agent is processing.
 * - Tracks the last agent message ID for feedback.
 * @param agentChatProps
 * @param agentChatProps.isProcessing
 * @param agentChatProps.messages
 */
export function useImageStudioAgentSync( agentChatProps: {
	isProcessing?: boolean;
	messages?: Array< AgentMessage >;
} ) {
	const { isProcessing, messages } = agentChatProps || {};
	const lastTrackedMessageId = useRef< string | null >( null );

	const { setImageStudioAiProcessing, setLastAgentMessageId } = useDispatch(
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

		if ( lastAgentMessage?.id && lastAgentMessage.id !== lastTrackedMessageId.current ) {
			lastTrackedMessageId.current = lastAgentMessage.id;
			setLastAgentMessageId( lastAgentMessage.id );
		}
	}, [ messages, setLastAgentMessageId ] );
}
