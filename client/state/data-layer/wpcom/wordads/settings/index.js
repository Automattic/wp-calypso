import { translate } from 'i18n-calypso';
import { WORDADS_SETTINGS_REQUEST, WORDADS_SETTINGS_SAVE } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { saveJetpackSettings } from 'calypso/state/jetpack/settings/actions';
import { errorNotice, removeNotice, successNotice } from 'calypso/state/notices/actions';
import getWordadsSettings from 'calypso/state/selectors/get-wordads-settings';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import {
	saveWordadsSettingsFailure,
	saveWordadsSettingsSuccess,
	updateWordadsSettings,
} from 'calypso/state/wordads/settings/actions';

const noop = () => {};

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
 * @param   {Object}   action         Redux action
 * @returns {Object}   Dispatched http action
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
 * @param   {Object} action Redux action
 * @returns {Object} Dispatched http action
 */
export const saveWordadsSettings = ( action ) => ( dispatch, getState ) => {
	const { settings, siteId } = action;
	const state = getState();
	const previousSettings = getWordadsSettings( state, siteId );

	// WordAds settings on Jetpack sites are not updatable on the WordAds API endpoint, so we
	// update them from the site settings endpoints.
	const isJetpack = isJetpackSite( state, siteId );
	if ( isJetpack ) {
		let jetpackSettings = {
			wordads: settings.jetpack_module_enabled,
		};
		if ( settings.jetpack_module_enabled ) {
			jetpackSettings = {
				...jetpackSettings,
				wordads_display_front_page: settings.display_options.display_front_page,
				wordads_display_post: settings.display_options.display_post,
				wordads_display_page: settings.display_options.display_page,
				wordads_display_archive: settings.display_options.display_archive,
				enable_header_ad: settings.display_options.enable_header_ad,
				wordads_second_belowpost: settings.display_options.second_belowpost,
				wordads_inline_enabled: settings.display_options.inline_enabled,
				wordads_ccpa_enabled: settings.ccpa_enabled,
				wordads_ccpa_privacy_policy_url: settings.ccpa_privacy_policy_url,
				wordads_custom_adstxt_enabled: settings.custom_adstxt_enabled,
				wordads_custom_adstxt: settings.custom_adstxt,
				wordads_cmp_enabled: settings.cmp_enabled,
			};
		}
		dispatch( saveJetpackSettings( siteId, jetpackSettings ) );
	}

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
