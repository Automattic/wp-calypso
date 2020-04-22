/**
 * External dependencies
 */
import { noop } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice, removeNotice, successNotice } from 'state/notices/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { WORDADS_SETTINGS_REQUEST, WORDADS_SETTINGS_SAVE } from 'state/action-types';
import getWordadsSettings from 'state/selectors/get-wordads-settings';
import {
	saveWordadsSettingsFailure,
	saveWordadsSettingsSuccess,
	updateWordadsSettings,
} from 'state/wordads/settings/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

const fromApi = ( data ) => {
	if ( ! data.hasOwnProperty( 'settings' ) ) {
		throw new Error( 'Missing settings field in response' );
	}

	return data.settings;
};

const receiveWordadsSettings = ( { siteId }, settings ) =>
	updateWordadsSettings( siteId, settings );

/**
 * Dispatches a request to fetch WordAds settings for a given site
 *
 * @param   {object}   action         Redux action
 * @returns {object}   Dispatched http action
 */
export const requestWordadsSettings = ( action ) => {
	const { siteId } = action;

	return http(
		{
			apiVersion: '1.1',
			method: 'GET',
			path: '/sites/' + siteId + '/wordads/settings/',
		},
		action
	);
};

/**
 * Dispatches a request to save particular settings on a site
 *
 * @param   {object} action Redux action
 * @returns {object} Dispatched http action
 */
export const saveWordadsSettings = ( action ) => ( dispatch, getState ) => {
	const { settings, siteId } = action;
	const previousSettings = getWordadsSettings( getState(), siteId );

	// Optimistically update settings to the new ones
	dispatch( updateWordadsSettings( siteId, settings ) );

	dispatch( removeNotice( `wordads-notice-success-${ siteId }` ) );
	dispatch( removeNotice( `wordads-notice-error-${ siteId }` ) );

	dispatch(
		http(
			{
				apiVersion: '1.1',
				method: 'POST',
				path: '/sites/' + siteId + '/wordads/settings/',
				body: settings,
			},
			{
				...action,
				meta: { ...action.meta, settings: previousSettings },
			}
		)
	);
};

export const handleSaveSuccess = ( { siteId } ) => [
	saveWordadsSettingsSuccess( siteId ),
	successNotice( translate( 'WordAds settings saved successfully!' ), {
		id: `wordads-notice-success-${ siteId }`,
		duration: 5000,
	} ),
];

export const handleSaveFailure = ( {
	siteId,
	meta: {
		settings: previousSettings,
		dataLayer: {
			error: { error },
		},
	},
} ) => [
	saveWordadsSettingsFailure( siteId ),
	updateWordadsSettings( siteId, previousSettings ),
	errorNotice(
		error === 'invalid_paypal'
			? translate( 'Please enter a valid PayPal email address.' )
			: translate( 'An unexpected error occurred. Please try again later.' ),
		{ id: `wordads-notice-error-${ siteId }`, duration: 5000 }
	),
];

registerHandlers( 'state/data-layer/wpcom/wordads/settings/index.js', {
	[ WORDADS_SETTINGS_REQUEST ]: [
		dispatchRequest( {
			fetch: requestWordadsSettings,
			onSuccess: receiveWordadsSettings,
			onError: noop,
			fromApi,
		} ),
	],

	[ WORDADS_SETTINGS_SAVE ]: [
		dispatchRequest( {
			fetch: saveWordadsSettings,
			onSuccess: handleSaveSuccess,
			onError: handleSaveFailure,
		} ),
	],
} );
