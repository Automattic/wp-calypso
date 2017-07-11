/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { fetchPagesError, updatePages } from '../../pages/actions';
import { WP_JOB_MANAGER_FETCH_PAGES } from 'wp-job-manager/state/action-types';

export const fetchExtensionPages = ( { dispatch }, action ) => {
	const { siteId } = action;

	dispatch( http( {
		method: 'GET',
		path: `/jetpack-blogs/${ siteId }/rest-api/`,
		query: {
			path: '/wp/v2/pages',
		},
	}, action ) );
};

export const updateExtensionPages = ( { dispatch }, { siteId }, next, { data } ) =>
	dispatch( updatePages( siteId, data ) );

export const fetchExtensionPagesError = ( { dispatch }, { siteId } ) => dispatch( fetchPagesError( siteId ) );

const dispatchPagesRequest = dispatchRequest( fetchExtensionPages, updateExtensionPages, fetchExtensionPagesError );

export default {
	[ WP_JOB_MANAGER_FETCH_PAGES ]: [ dispatchPagesRequest ],
};
