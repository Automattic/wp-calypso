/** @format */

/**
 * External dependencies
 */
import { get, noop } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { JETPACK_ONBOARDING_SETTINGS_SAVE } from 'state/action-types';

/**
 * Dispatches a request to save particular onboarding settings on a site
 *
 * @param   {Object} action Redux action
 * @returns {Object} Dispatched http action
 */
export const saveJetpackOnboardingSettings = ( { dispatch, getState }, action ) => {
	const { settings, siteId } = action;
	const state = getState();
	const token = get( state.jetpackOnboarding.credentials, [ siteId, 'token' ], null );
	const jpUser = get( state.jetpackOnboarding.credentials, [ siteId, 'userEmail' ], null );

	return dispatch(
		http(
			{
				apiVersion: '1.1',
				method: 'POST',
				path: '/jetpack-blogs/' + siteId + '/rest-api/',
				body: {
					path: '/jetpack/v4/settings/',
					body: JSON.stringify( {
						onboarding: {
							...settings,
							token,
							jpUser,
						},
					} ),
					json: true,
				},
			},
			action
		)
	);
};

export const announceSaveFailure = ( { dispatch } ) =>
	dispatch( errorNotice( translate( 'An unexpected error occurred. Please try again later.' ) ) );

export default {
	[ JETPACK_ONBOARDING_SETTINGS_SAVE ]: [
		dispatchRequest( saveJetpackOnboardingSettings, noop, announceSaveFailure ),
	],
};
