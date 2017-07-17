/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { requestPagesError, updatePages } from '../../pages/actions';
import { WP_JOB_MANAGER_REQUEST_PAGES } from 'wp-job-manager/state/action-types';

export const requestExtensionPages = ( { dispatch }, action ) => {
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

export const requestExtensionPagesError = ( { dispatch }, { siteId } ) => dispatch( requestPagesError( siteId ) );

const dispatchPagesRequest = dispatchRequest( requestExtensionPages, updateExtensionPages, requestExtensionPagesError );

export default {
	[ WP_JOB_MANAGER_REQUEST_PAGES ]: [ dispatchPagesRequest ],
};
