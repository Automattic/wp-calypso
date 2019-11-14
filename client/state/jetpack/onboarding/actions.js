/**
 * Internal dependencies
 */
import { JETPACK_ONBOARDING_CREDENTIALS_RECEIVE } from 'state/action-types';

export const receiveJetpackOnboardingCredentials = ( siteId, credentials ) => ( {
	type: JETPACK_ONBOARDING_CREDENTIALS_RECEIVE,
	siteId,
	credentials,
} );
