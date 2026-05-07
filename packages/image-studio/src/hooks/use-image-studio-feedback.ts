import { rateMessage, submitFeedback } from '@automattic/agents-manager';
import { useSelect } from '@wordpress/data';
import { useCallback, useMemo } from '@wordpress/element';
import { store as imageStudioStore } from '../store';
import type { ImageStudioMode } from '../types';
import type { AuthProvider } from '@automattic/agenttic-client';

interface UseImageStudioFeedbackConfig {
	authProvider?: AuthProvider;
	sessionId?: string;
	displayImageUrl?: string | null;
	mode?: ImageStudioMode;
}

export const useImageStudioFeedback = ( config: UseImageStudioFeedbackConfig = {} ) => {
	const { authProvider, sessionId, displayImageUrl, mode } = config;

	const lastAgentMessageId = useSelect(
		( select ) => select( imageStudioStore ).getLastAgentMessageId(),
		[]
	);

	const metadata = useMemo( () => {
		const meta: Record< string, string > = {};
		if ( displayImageUrl ) {
			meta.image_url = displayImageUrl;
		}
		if ( mode ) {
			meta.mode = mode;
		}
		return Object.keys( meta ).length > 0 ? meta : undefined;
	}, [ displayImageUrl, mode ] );

	const handleFeedback = useCallback(
		( feedback: 'up' | 'down' ) => {
			if ( authProvider && sessionId && lastAgentMessageId ) {
				rateMessage( authProvider, sessionId, lastAgentMessageId, feedback, undefined, metadata );
			}
		},
		[ authProvider, sessionId, lastAgentMessageId, metadata ]
	);

	const handleSubmitFeedbackText = useCallback(
		async ( feedbackText: string ) => {
			if ( ! feedbackText.trim() || ! sessionId || ! lastAgentMessageId || ! authProvider ) {
				return;
			}

			await submitFeedback( authProvider, sessionId, lastAgentMessageId, feedbackText.trim() );
		},
		[ sessionId, authProvider, lastAgentMessageId ]
	);

	return {
		handleFeedback,
		handleSubmitFeedbackText,
	};
};
