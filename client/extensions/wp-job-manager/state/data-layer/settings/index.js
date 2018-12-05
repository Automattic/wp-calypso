/** @format */

/**
 * External dependencies
 */

import { translate } from 'i18n-calypso';
import { initialize, startSubmit as startSave, stopSubmit as stopSave } from 'redux-form';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { errorNotice, removeNotice, successNotice } from 'state/notices/actions';
import { fetchError, updateSettings } from '../../settings/actions';
import {
	WP_JOB_MANAGER_FETCH_SETTINGS,
	WP_JOB_MANAGER_SAVE_SETTINGS,
} from 'wp-job-manager/state/action-types';
import { fromApi, toApi } from './utils';

export const fetchExtensionSettings = action =>
	http(
		{
			method: 'GET',
			path: `/jetpack-blogs/${ action.siteId }/rest-api/`,
			query: {
				path: '/wpjm/v1/settings',
			},
		},
		action
	);

export const updateExtensionSettings = ( action, data ) => updateSettings( action.siteId, data );

export const fetchExtensionError = action => fetchError( action.siteId );

export const saveSettings = action => [
	startSave( action.form ),
	removeNotice( 'wpjm-settings-save' ),
	http(
		{
			method: 'POST',
			path: `/jetpack-blogs/${ action.siteId }/rest-api/`,
			query: {
				body: JSON.stringify( toApi( action.data ) ),
				json: true,
				path: '/wpjm/v1/settings',
			},
		},
		action
	),
];

export const announceSuccess = ( action, updatedData ) => [
	stopSave( action.form ),
	initialize( action.form, updatedData ),
	updateSettings( action.siteId, updatedData ),
	successNotice( translate( 'Settings saved!' ), { id: 'wpjm-settings-save' } ),
];

export const announceFailure = action => [
	stopSave( action.form ),
	errorNotice( translate( 'There was a problem saving your changes. Please try again.' ), {
		id: 'wpjm-settings-save',
	} ),
];

const dispatchFetchSettingsRequest = dispatchRequestEx( {
	fetch: fetchExtensionSettings,
	onSuccess: updateExtensionSettings,
	onError: fetchExtensionError,
	fromApi,
} );

const dispatchSaveSettingsRequest = dispatchRequestEx( {
	fetch: saveSettings,
	onSuccess: announceSuccess,
	onError: announceFailure,
	fromApi,
} );

export default {
	[ WP_JOB_MANAGER_FETCH_SETTINGS ]: [ dispatchFetchSettingsRequest ],
	[ WP_JOB_MANAGER_SAVE_SETTINGS ]: [ dispatchSaveSettingsRequest ],
};
