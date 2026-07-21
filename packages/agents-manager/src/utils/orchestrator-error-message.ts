import { __ } from '@wordpress/i18n';

// Map orchestrator (Jetpack AI sidebar) errors whose server messages are not
// client-translated to a localized copy, mirroring reader-chat-error-message.
// Non-matching errors pass through unchanged.
export function getOrchestratorErrorMessage( error: string | null ): string | null {
	if ( ! error ) {
		return null;
	}

	if (
		error === 'ai_editorial_review_over_limit' ||
		error === 'review_mediator_over_limit' ||
		/jetpack ai usage limit/i.test( error )
	) {
		return __(
			'You have reached your Jetpack AI usage limit. Upgrade your plan to continue.',
			__i18n_text_domain__
		);
	}

	return error;
}
