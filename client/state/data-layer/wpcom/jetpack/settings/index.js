/** @format */

/**
 * External dependencies
 */
import { get, omit, startsWith } from 'lodash';
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
import { getUnconnectedSiteUrl } from 'state/selectors';
import {
	saveJetpackOnboardingSettingsSuccess,
	updateJetpackOnboardingSettings,
} from 'state/jetpack-onboarding/actions';
import { trailingslashit } from 'lib/route';

export const MAX_WOOCOMMERCE_INSTALL_RETRIES = 2;

export const fromApi = response => {
	if ( ! response.data ) {
		throw new Error( 'missing settings' );
	}

	return response.data;
};

const receiveJetpackOnboardingSettings = ( { dispatch }, { siteId }, settings ) => {
	dispatch( updateJetpackOnboardingSettings( siteId, settings ) );
};

/**
 * Dispatches a request to fetch settings for a given site
 *
 * @param   {Object}   store          Redux store
 * @param   {Function} store.dispatch Dispatch Redux action
 * @param   {Object}   action         Redux action
 * @returns {Object}   Dispatched http action
 */
export const requestJetpackOnboardingSettings = ( { dispatch }, action ) => {
	const { siteId, query } = action;

	return dispatch(
		http(
			{
				apiVersion: '1.1',
				method: 'GET',
				path: '/jetpack-blogs/' + siteId + '/rest-api/',
				query: {
					path: '/jetpack/v4/settings/',
					query: JSON.stringify( query ),
					json: true,
				},
			},
			action
		)
	);
};

export const announceRequestFailure = ( { dispatch, getState }, { siteId } ) => {
	const url = getUnconnectedSiteUrl( getState(), siteId );
	const noticeOptions = {
		id: `jpo-communication-error-${ siteId }`,
	};

	if ( url ) {
		noticeOptions.button = translate( 'Visit site admin' );
		noticeOptions.href = trailingslashit( url ) + 'wp-admin/admin.php?page=jetpack';
	}

	return dispatch( errorNotice( translate( 'Something went wrong.' ), noticeOptions ) );
};

/**
 * Dispatches a request to save particular settings on a site
 *
 * @param   {Object} action Redux action
 * @returns {Object} Dispatched http action
 */
export const saveJetpackOnboardingSettings = ( { dispatch }, action ) => {
	const { settings, siteId } = action;

	// We don't want Jetpack Onboarding credentials in our Jetpack Settings Redux state.
	const settingsWithoutCredentials = omit( settings, [ 'onboarding.jpUser', 'onboarding.token' ] );
	dispatch( updateJetpackOnboardingSettings( siteId, settingsWithoutCredentials ) );

	return dispatch(
		http(
			{
				apiVersion: '1.1',
				method: 'POST',
				path: '/jetpack-blogs/' + siteId + '/rest-api/',
				body: {
					path: '/jetpack/v4/settings/',
					body: JSON.stringify( settings ),
					json: true,
				},
			},
			action
		)
	);
};

// Although we don't use the save success action in any of the reducers,
// we need to dispatch some action in order to signal to the data layer that
// the save request has finished. Tracking those requests is necessary for
// displaying an up to date progress indicator for some steps.
export const handleSaveSuccess = ( { dispatch }, { siteId, settings } ) =>
	dispatch( saveJetpackOnboardingSettingsSuccess( siteId, settings ) );

export const announceSaveFailure = ( { dispatch }, { siteId } ) =>
	dispatch(
		errorNotice( translate( 'An unexpected error occurred. Please try again later.' ), {
			id: `jpo-notice-error-${ siteId }`,
			duration: 5000,
		} )
	);

export const retryOrAnnounceSaveFailure = ( { dispatch }, action, { message: errorMessage } ) => {
	const { settings, siteId, type, meta: { dataLayer } } = action;
	const { retryCount = 0 } = dataLayer;

	// If we got a timeout on WooCommerce installation, try again (up to 3 times),
	// since it might just be a slow server that actually ends up installing it
	// properly, in which case a subsequent request will return 'success'.
	if (
		get( settings, [ 'onboarding', 'installWooCommerce' ] ) !== true ||
		! startsWith( errorMessage, 'cURL error 28' ) || // cURL timeout
		retryCount > MAX_WOOCOMMERCE_INSTALL_RETRIES
	) {
		return announceSaveFailure( { dispatch }, { siteId } );
	}

	// We cannot use `extendAction( action, ... )` here, since `meta.dataLayer` now includes error information,
	// which we would propagate, causing the data layer to think there's been an error on the subsequent attempt.
	// Instead, we have to re-assemble our action.
	dispatch( {
		settings,
		siteId,
		type,
		meta: {
			dataLayer: {
				retryCount: retryCount + 1,
				trackRequest: true,
			},
		},
	} );
};

export default {
	[ JETPACK_ONBOARDING_SETTINGS_REQUEST ]: [
		dispatchRequest(
			requestJetpackOnboardingSettings,
			receiveJetpackOnboardingSettings,
			announceRequestFailure,
			{
				fromApi,
			}
		),
	],
	[ JETPACK_ONBOARDING_SETTINGS_SAVE ]: [
		dispatchRequest( saveJetpackOnboardingSettings, handleSaveSuccess, retryOrAnnounceSaveFailure ),
	],
};
