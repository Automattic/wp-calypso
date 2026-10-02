import { __ } from '@wordpress/i18n';

/**
 * The server's error code for a second result to the same browser tool call: another
 * page answered first and the turn continues there, so it is not an error to show.
 */
export const TOOL_RESULT_ALREADY_RECEIVED = 'tool_result_already_received';

function isUsageLimitError( error: string ): boolean {
	return error === 'ai_editorial_review_over_limit' || /jetpack ai usage limit/i.test( error );
}

// Map orchestrator (Jetpack AI sidebar) errors whose server messages are not
// client-translated to a localized copy, mirroring reader-chat-error-message.
// Non-matching errors pass through unchanged.
export function getOrchestratorErrorMessage( error: string | null ): string | null {
	if ( ! error ) {
		return null;
	}

	if ( isUsageLimitError( error ) ) {
		return __(
			'You have reached your Jetpack AI usage limit. Upgrade your plan to continue.',
			__i18n_text_domain__
		);
	}

	return error;
}

/**
 * A coarse class for a chat error, safe to send to Tracks: the raw server
 * message can carry request details, so it is never sent itself.
 */
export function getOrchestratorErrorType( error: string ): 'usage_limit' | 'rate_limit' | 'other' {
	if ( isUsageLimitError( error ) ) {
		return 'usage_limit';
	}

	if ( /\b429\b|too many requests|rate limit/i.test( error ) ) {
		return 'rate_limit';
	}

	return 'other';
}
