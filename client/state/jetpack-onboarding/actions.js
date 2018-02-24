/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import {
	JETPACK_ONBOARDING_CREDENTIALS_RECEIVE,
	JETPACK_ONBOARDING_SETTINGS_REQUEST,
	JETPACK_SETTINGS_SAVE,
	JETPACK_SETTINGS_SAVE_SUCCESS,
	JETPACK_ONBOARDING_SETTINGS_UPDATE,
} from 'state/action-types';
import { getUnconnectedSite } from 'state/selectors';

export const receiveJetpackOnboardingCredentials = ( siteId, credentials ) => ( {
	type: JETPACK_ONBOARDING_CREDENTIALS_RECEIVE,
	siteId,
	credentials,
} );

export const requestJetpackSettings = ( siteId, query ) => ( {
	type: JETPACK_ONBOARDING_SETTINGS_REQUEST,
	siteId,
	query,
	meta: {
		dataLayer: {
			trackRequest: true,
		},
	},
} );

export const requestJetpackOnboardingSettings = siteId => ( dispatch, getState ) => {
	const state = getState();
	const credentials = getUnconnectedSite( state, siteId );
	const token = get( credentials, 'token', null );
	const jpUser = get( credentials, 'userEmail', null );

	dispatch(
		requestJetpackSettings( siteId, {
			onboarding: {
				token,
				jpUser,
			},
		} )
	);
};

export const saveJetpackSettings = ( siteId, settings ) => ( {
	type: JETPACK_SETTINGS_SAVE,
	siteId,
	settings,
	meta: {
		dataLayer: {
			trackRequest: true,
		},
	},
} );

export const saveJetpackOnboardingSettings = ( siteId, onboardingSettings ) => (
	dispatch,
	getState
) => {
	const state = getState();
	const token = get( state.jetpackOnboarding.credentials, [ siteId, 'token' ], null );
	const jpUser = get( state.jetpackOnboarding.credentials, [ siteId, 'userEmail' ], null );

	dispatch(
		saveJetpackSettings( siteId, {
			onboarding: {
				...onboardingSettings,
				token,
				jpUser,
			},
		} )
	);
};

export const saveJetpackSettingsSuccess = ( siteId, settings ) => ( {
	type: JETPACK_SETTINGS_SAVE_SUCCESS,
	siteId,
	settings,
} );

export const updateJetpackSettings = ( siteId, settings ) => ( {
	type: JETPACK_ONBOARDING_SETTINGS_UPDATE,
	siteId,
	settings,
} );
