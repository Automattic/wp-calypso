import { __ } from '@wordpress/i18n';

const QUOTA_EXHAUSTED_CODE =
	/^(?:(?:(?:protocol request|streaming) error|http \d{3}):\s*)?jetpack_ai_quota_exhausted(?:[.!:\s]|$)/i;
const QUOTA_EXHAUSTED_MESSAGE =
	/^(?:(?:(?:protocol request|streaming) error|http \d{3}):\s*)?(?:you have reached your jetpack ai usage limit|jetpack ai usage limit reached)(?:[.!:\s]|$)/i;

// Map orchestrator (Jetpack AI sidebar) errors whose server messages are not
// client-translated to a localized copy, mirroring reader-chat-error-message.
// Non-matching errors pass through unchanged.
export function getOrchestratorErrorMessage( error: string | null ): string | null {
	if ( ! error ) {
		return null;
	}

	if (
		error === 'ai_editorial_review_over_limit' ||
		QUOTA_EXHAUSTED_CODE.test( error ) ||
		QUOTA_EXHAUSTED_MESSAGE.test( error )
	) {
		return __(
			'You have reached your Jetpack AI usage limit. Upgrade your plan to continue.',
			__i18n_text_domain__
		);
	}

	return error;
}
