/** @format */

/**
 * Internal dependencies
 */
import {
	JETPACK_ONBOARDING_CREDENTIALS_RECEIVE,
	JETPACK_ONBOARDING_SETTINGS_REQUEST,
	JETPACK_ONBOARDING_SETTINGS_SAVE,
	JETPACK_ONBOARDING_SETTINGS_SAVE_SUCCESS,
	JETPACK_ONBOARDING_SETTINGS_UPDATE,
} from 'state/action-types';

export const receiveJetpackOnboardingCredentials = ( siteId, credentials ) => ( {
	type: JETPACK_ONBOARDING_CREDENTIALS_RECEIVE,
	siteId,
	credentials,
} );

export const requestJetpackOnboardingSettings = siteId => ( {
	type: JETPACK_ONBOARDING_SETTINGS_REQUEST,
	siteId,
	meta: {
		dataLayer: {
			trackRequest: true,
		},
	},
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

export const saveJetpackOnboardingSettingsSuccess = ( siteId, settings ) => ( {
	type: JETPACK_ONBOARDING_SETTINGS_SAVE_SUCCESS,
	siteId,
	settings,
} );

export const updateJetpackOnboardingSettings = ( siteId, settings ) => ( {
	type: JETPACK_ONBOARDING_SETTINGS_UPDATE,
	siteId,
	settings,
} );
