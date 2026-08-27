import { __ } from '@wordpress/i18n';
import type { AbilityResult } from './types';

/**
 * The result envelope abilities return. For the tools the backend acks without
 * an LLM round-trip it reads `success`, `message`, and `error` — and a
 * non-empty `error` reads as failure even next to `success: true`, so only
 * failures ever carry one.
 */

/**
 * A successful ability result. `message` is what the user reads; `details`
 * carry structured data for the agent.
 */
export function successResult(
	message: string,
	details?: Record< string, unknown >
): AbilityResult {
	return {
		result: { success: true, message, ...( details && { details } ) },
		returnToAgent: true,
	};
}

/**
 * A failed ability result. `error` is the technical reason for the agent;
 * `message` is what the user reads, so it stays generic unless an ability has
 * something more useful to say.
 */
export function errorResult(
	error: string,
	message: string = __(
		'There was an error with this request. Please try again.',
		__i18n_text_domain__
	),
	details?: Record< string, unknown >
): AbilityResult {
	return {
		result: { success: false, message, error, ...( details && { details } ) },
		returnToAgent: true,
	};
}
