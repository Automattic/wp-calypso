/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { displaySettings, enableSettings } from '../../settings/actions';
import { WP_JOB_MANAGER_FETCH_SETTINGS } from 'wp-job-manager/state/action-types';

export const fetch = ( { dispatch }, action ) => {
	const { siteId } = action;

	dispatch( http( {
		method: 'GET',
		path: `/jetpack-blogs/${ siteId }/rest-api/`,
		query: {
			path: '/wpjm/v1/settings',
		},
	}, action ) );
};

export const displayAndEnable = ( { dispatch }, { siteId }, next, { data } ) => {
	dispatch( displaySettings( siteId, data ) );
	dispatch( enableSettings( siteId ) );
};

export const enable = ( { dispatch }, { siteId } ) => dispatch( enableSettings( siteId ) );

const dispatchSettingsRequest = dispatchRequest( fetch, displayAndEnable, enable );

export default {
	[ WP_JOB_MANAGER_FETCH_SETTINGS ]: [ dispatchSettingsRequest ],
};
