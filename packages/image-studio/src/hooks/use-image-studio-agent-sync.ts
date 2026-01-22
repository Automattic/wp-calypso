import { useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { type ImageStudioActions, store as imageStudioStore } from '../store';

/**
 * Keeps Image Studio store in sync with Agent chat state.
 *
 * - Updates AI processing status when agent is processing.
 * @param agentChatProps
 * @param agentChatProps.isProcessing
 * @param agentChatProps.messages
 */
export function useImageStudioAgentSync( agentChatProps: {
	isProcessing?: boolean;
	messages?: Array< { role: string } >;
} ) {
	const { isProcessing } = agentChatProps || {};

	const { setImageStudioAiProcessing } = useDispatch( imageStudioStore ) as ImageStudioActions;

	// Sync processing state
	useEffect( () => {
		setImageStudioAiProcessing( {
			source: 'agent',
			value: isProcessing || false,
		} );
	}, [ isProcessing, setImageStudioAiProcessing ] );
}
