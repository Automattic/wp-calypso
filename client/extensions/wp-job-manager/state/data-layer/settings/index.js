/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { fetchError, updateSettings } from '../../settings/actions';
import { WP_JOB_MANAGER_FETCH_SETTINGS } from 'wp-job-manager/state/action-types';

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

export const updateExtensionSettings = ( { dispatch }, { siteId }, next, { data } ) => dispatch( updateSettings( siteId, data ) );

export const fetchExtensionError = ( { dispatch }, { siteId } ) => dispatch( fetchError( siteId ) );

const dispatchSettingsRequest = dispatchRequest( fetchExtensionSettings, updateExtensionSettings, fetchExtensionError );

export default {
	[ WP_JOB_MANAGER_FETCH_SETTINGS ]: [ dispatchSettingsRequest ],
};
