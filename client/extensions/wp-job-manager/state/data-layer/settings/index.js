/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice, removeNotice, successNotice } from 'state/notices/actions';
import { fetchError, saveError, saveSuccess, updateSettings } from '../../settings/actions';
import { WP_JOB_MANAGER_FETCH_SETTINGS, WP_JOB_MANAGER_SAVE_SETTINGS } from 'wp-job-manager/state/action-types';
import { fromApi, toApi } from './utils';

export const fetchExtensionSettings = ( { dispatch }, action ) => {
	const { siteId } = action;

	dispatch( http( {
		method: 'GET',
		path: `/jetpack-blogs/${ siteId }/rest-api/`,
		query: {
			path: '/wpjm/v1/settings',
		},
	}, action ) );
};

export const updateExtensionSettings = ( { dispatch }, { siteId }, next, { data } ) =>
	dispatch( updateSettings( siteId, fromApi( data ) ) );

export const fetchExtensionError = ( { dispatch }, { siteId } ) =>
	dispatch( fetchError( siteId ) );

export const saveSettings = ( { dispatch, getState }, action ) => {
	const { data, siteId } = action;

	dispatch( removeNotice( 'wpjm-settings-save' ) );
	dispatch( http( {
		method: 'POST',
		path: `/jetpack-blogs/${ siteId }/rest-api/`,
		query: {
			body: JSON.stringify( toApi( data ) ),
			json: true,
			path: '/wpjm/v1/settings',
		},
	}, action ) );
};

export const announceSuccess = ( { dispatch }, { siteId } ) => {
	dispatch( saveSuccess( siteId ) );
	dispatch( successNotice( translate(
		'Settings saved!' ),
		{ id: 'wpjm-settings-save' }
	) );
};

export const announceFailure = ( { dispatch }, { siteId } ) => {
	dispatch( saveError( siteId ) );
	dispatch( errorNotice(
		translate( 'There was a problem saving your changes. Please try again.' ),
		{ id: 'wpjm-settings-save' }
	) );
};

const dispatchFetchSettingsRequest = dispatchRequest( fetchExtensionSettings, updateExtensionSettings, fetchExtensionError );
const dispatchSaveSettingsRequest = dispatchRequest( saveSettings, announceSuccess, announceFailure );

export default {
	[ WP_JOB_MANAGER_FETCH_SETTINGS ]: [ dispatchFetchSettingsRequest ],
	[ WP_JOB_MANAGER_SAVE_SETTINGS ]: [ dispatchSaveSettingsRequest ],
};
