/** @format */

/**
 * Internal dependencies
 */
import {
	JETPACK_ONBOARDING_CREDENTIALS_RECEIVE,
	JETPACK_ONBOARDING_SETTINGS_SAVE,
	JETPACK_ONBOARDING_SETTINGS_UPDATE,
} from 'state/action-types';

export const receiveJetpackOnboardingCredentials = ( siteId, credentials ) => ( {
	type: JETPACK_ONBOARDING_CREDENTIALS_RECEIVE,
	siteId,
	credentials,
} );

export const saveJetpackOnboardingSettings = ( siteId, settings ) => ( {
	type: JETPACK_ONBOARDING_SETTINGS_SAVE,
	siteId,
	settings,
	meta: {
		dataLayer: {
			trackRequest: true,
		},
	},
} );

export const updateJetpackOnboardingSettings = ( siteId, settings ) => ( {
	type: JETPACK_ONBOARDING_SETTINGS_UPDATE,
	siteId,
	settings,
} );
