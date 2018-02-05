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
import {
	JETPACK_ONBOARDING_SETTINGS_REQUEST,
	JETPACK_ONBOARDING_SETTINGS_SAVE,
} from 'state/action-types';
import { getUnconnectedSite } from 'state/selectors';
import { updateJetpackOnboardingSettings } from 'state/jetpack-onboarding/actions';

export const fromApi = response => {
	if ( ! response.data || ! response.data.onboarding ) {
		throw new Error( 'missing onboarding settings' );
	}

	return response.data.onboarding;
};

const receiveJetpackOnboardingSettings = ( { dispatch }, { siteId }, settings ) => {
	dispatch( updateJetpackOnboardingSettings( siteId, settings ) );
};

/**
 * Dispatches a request to fetch settings for a given site
 *
 * @param   {Object}   store          Redux store
 * @param   {Function} store.dispatch Dispatch Redux action
 * @param   {Function} store.getState Get Redux state
 * @param   {Object}   action         Redux action
 * @returns {Object}   Dispatched http action
 */
export const requestJetpackOnboardingSettings = ( { dispatch, getState }, action ) => {
	const { siteId } = action;
	const state = getState();
	const credentials = getUnconnectedSite( state, siteId );
	const token = get( credentials, 'token' );
	const jpUser = get( credentials, 'userEmail' );

	return dispatch(
		http(
			{
				apiVersion: '1.1',
				method: 'GET',
				path: '/jetpack-blogs/' + siteId + '/rest-api/',
				query: {
					path: '/jetpack/v4/settings/',
					query: JSON.stringify( {
						onboarding: {
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

	dispatch( updateJetpackOnboardingSettings( siteId, action.settings ) );

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

export const announceSaveFailure = ( { dispatch }, { siteId } ) =>
	dispatch(
		errorNotice( translate( 'An unexpected error occurred. Please try again later.' ), {
			id: `jpo-notice-error-${ siteId }`,
			duration: 5000,
		} )
	);

export default {
	[ JETPACK_ONBOARDING_SETTINGS_REQUEST ]: [
		dispatchRequest( requestJetpackOnboardingSettings, receiveJetpackOnboardingSettings, noop, {
			fromApi,
		} ),
	],
	[ JETPACK_ONBOARDING_SETTINGS_SAVE ]: [
		dispatchRequest( saveJetpackOnboardingSettings, noop, announceSaveFailure ),
	],
};
