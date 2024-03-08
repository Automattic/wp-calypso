import { recordTracksEvent } from '@automattic/calypso-analytics';
import type { ErrorParameters } from './types';

export * from './recaptcha';

const FLOW_ID = 'gutenboarding';

/**
 * Make tracks call with embedded flow.
 * @param {string} eventId The name/id of the tracks event. Must be in snake_case and prefixed with "calypso" e.g. `calypso_something_snake_case`
 * @param {Object} params A set of params to pass to analytics
 * @param {string} flow (Optional) The id of the flow, e.g., 'gutenboarding'
 */
export function trackEventWithFlow( eventId: string, params = {}, flow = FLOW_ID ): void {
	recordTracksEvent( eventId, {
		flow,
		...params,
	} );
}

/**
 * A generic event for onboarding errors
 * @param {Object} params A set of params to pass to analytics for signup errors
 */
export function recordOnboardingError( params: ErrorParameters ): void {
	trackEventWithFlow( 'calypso_newsite_error', {
		error: params.error,
		step: params.step,
	} );
}
