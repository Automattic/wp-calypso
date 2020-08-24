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
import { JETPACK_SETTINGS_REQUEST, JETPACK_SETTINGS_SAVE } from 'state/action-types';
import getJetpackSettings from 'state/selectors/get-jetpack-settings';
import getSiteUrl from 'state/selectors/get-site-url';
import {
	filterSettingsByActiveModules,
	normalizeSettings,
	sanitizeSettings,
} from 'state/jetpack/settings/utils';
import { saveJetpackSettingsSuccess, updateJetpackSettings } from 'state/jetpack/settings/actions';
import { trailingslashit } from 'lib/route';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const MAX_WOOCOMMERCE_INSTALL_RETRIES = 2;

export const fromApi = ( response ) => {
	if ( ! response.data ) {
		throw new Error( 'missing settings' );
	}

	return normalizeSettings( response.data );
};

const toApi = ( settings ) => filterSettingsByActiveModules( sanitizeSettings( settings ) );

const receiveJetpackSettings = ( { siteId }, settings ) =>
	updateJetpackSettings( siteId, settings );
/**
 * Dispatches a request to fetch settings for a given site
 *
 * @param   {object}   action         Redux action
 * @returns {object}   Dispatched http action
 */
export const requestJetpackSettings = ( action ) => {
	const { siteId, query } = action;

	return http(
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
	);
};

export const announceRequestFailure = ( { siteId } ) => ( dispatch, getState ) => {
	const state = getState();
	const url = getSiteUrl( state, siteId );
	const noticeOptions = {
		id: `jps-communication-error-${ siteId }`,
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
 * @param   {object} action Redux action
 * @returns {object} Dispatched http action
 */
export const saveJetpackSettings = ( action ) => ( dispatch, getState ) => {
	const { settings, siteId } = action;
	const previousSettings = getJetpackSettings( getState(), siteId );

	// We don't want any legacy Jetpack Onboarding credentials in our Jetpack Settings Redux state.
	const settingsWithoutCredentials = omit( settings, [ 'onboarding.jpUser', 'onboarding.token' ] );
	dispatch( updateJetpackSettings( siteId, settingsWithoutCredentials ) );
	dispatch(
		http(
			{
				apiVersion: '1.1',
				method: 'POST',
				path: '/jetpack-blogs/' + siteId + '/rest-api/',
				body: {
					path: '/jetpack/v4/settings/',
					body: JSON.stringify( toApi( settings ) ),
					json: true,
				},
			},
			{
				...action,
				meta: { ...action.meta, settings: previousSettings },
			}
		)
	);
};

// We need to dispatch some action in order to signal to the data layer that
// the save request has finished. Tracking those requests is necessary for
// displaying an up to date progress indicator for some steps.
// We also need this to store a regenerated post-by-email address in Redux state.
export const handleSaveSuccess = ( { siteId }, { data: { code, message, ...updatedSettings } } ) =>
	saveJetpackSettingsSuccess( siteId, updatedSettings );

export const handleSaveFailure = ( { siteId }, { meta: { settings: previousSettings } } ) => [
	updateJetpackSettings( siteId, previousSettings ),
	errorNotice( translate( 'An unexpected error occurred. Please try again later.' ), {
		id: `jps-notice-error-${ siteId }`,
		duration: 5000,
	} ),
];

export const retryOrAnnounceSaveFailure = ( action, { message: errorMessage } ) => {
	const {
		settings,
		siteId,
		type,
		meta: { dataLayer },
	} = action;
	const { retryCount = 0 } = dataLayer;

	// If we got a timeout on WooCommerce installation, try again (up to 3 times),
	// since it might just be a slow server that actually ends up installing it
	// properly, in which case a subsequent request will return 'success'.
	if (
		get( settings, [ 'onboarding', 'installWooCommerce' ] ) !== true ||
		! startsWith( errorMessage, 'cURL error 28' ) || // cURL timeout
		retryCount > MAX_WOOCOMMERCE_INSTALL_RETRIES
	) {
		return handleSaveFailure( { siteId }, action );
	}

	// We cannot use `extendAction( action, ... )` here, since `meta.dataLayer` now includes error information,
	// which we would propagate, causing the data layer to think there's been an error on the subsequent attempt.
	// Instead, we have to re-assemble our action.
	return {
		settings,
		siteId,
		type,
		meta: {
			dataLayer: {
				retryCount: retryCount + 1,
				trackRequest: true,
			},
		},
	};
};

registerHandlers( 'state/data-layer/wpcom/jetpack/settings/index.js', {
	[ JETPACK_SETTINGS_REQUEST ]: [
		dispatchRequest( {
			fetch: requestJetpackSettings,
			onSuccess: receiveJetpackSettings,
			onError: announceRequestFailure,
			fromApi,
		} ),
	],

	[ JETPACK_SETTINGS_SAVE ]: [
		dispatchRequest( {
			fetch: saveJetpackSettings,
			onSuccess: handleSaveSuccess,
			onError: retryOrAnnounceSaveFailure,
		} ),
	],
} );
