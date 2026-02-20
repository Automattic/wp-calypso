import { rateMessage, submitFeedback } from '@automattic/agents-manager';
import { useSelect } from '@wordpress/data';
import { useCallback, useEffect, useState } from '@wordpress/element';
import { store as imageStudioStore } from '../store';
import type { AuthProvider } from '@automattic/agenttic-client';

interface UseImageStudioFeedbackConfig {
	/** Current displayed image URL — resets feedback state on change. */
	displayImageUrl?: string | null;
	/** Auth provider for API calls. */
	authProvider?: AuthProvider;
	/** Session ID for API calls. */
	sessionId?: string;
}

/**
 * Manages feedback for the image studio — both UI state and API calls.
 */
export const useImageStudioFeedback = ( config: UseImageStudioFeedbackConfig = {} ) => {
	const { displayImageUrl, authProvider, sessionId } = config;

	const [ showFeedbackInput, setShowFeedbackInput ] = useState( false );

	// Reset feedback state when the displayed image changes
	useEffect( () => {
		setShowFeedbackInput( false );
	}, [ displayImageUrl ] );

	const lastAgentMessageId = useSelect(
		( select ) => select( imageStudioStore ).getLastAgentMessageId(),
		[]
	);

	const handleFeedback = useCallback(
		( feedback: 'up' | 'down' ) => {
			if ( feedback === 'down' ) {
				setShowFeedbackInput( true );
			}

			if ( authProvider && sessionId && lastAgentMessageId ) {
				rateMessage( authProvider, sessionId, lastAgentMessageId, feedback );
			}
		},
		[ authProvider, sessionId, lastAgentMessageId ]
	);

	const handleCancelFeedback = useCallback( () => {
		setShowFeedbackInput( false );
	}, [] );

	const handleSubmitFeedbackText = useCallback(
		async ( feedbackText: string ) => {
			if ( ! feedbackText.trim() || ! sessionId || ! lastAgentMessageId || ! authProvider ) {
				return;
			}

			await submitFeedback( authProvider, sessionId, lastAgentMessageId, feedbackText.trim() );
			setShowFeedbackInput( false );
		},
		[ sessionId, authProvider, lastAgentMessageId ]
	);

	return {
		showFeedbackInput,
		handleFeedback,
		handleCancelFeedback,
		handleSubmitFeedbackText,
	};
};
