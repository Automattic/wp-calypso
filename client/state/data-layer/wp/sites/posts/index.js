/** @format */

/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { GUTENBERG_SITE_POST_REQUEST } from 'state/action-types';
import { dispatchRequest /*, getHeaders*/ } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';

/**
 * Dispatches a request to fetch a site post
 *
 * @param {Function} dispatch Redux dispatcher
 * @param {Object} action Redux action
 */
export const fetchSitePost = ( { dispatch }, action ) => {
	const { siteId, postId } = action;
	dispatch(
		http(
			{
				path: `/sites/${ siteId }/posts/${ postId }`,
				method: 'GET',
				apiNamespace: 'wp/v2',
			},
			action
		)
	);
};

export const receiveSuccess = ( { dispatch }, action, post ) => dispatch( noop( action, post ) );

const dispatchSitePostRequest = dispatchRequest( fetchSitePost, receiveSuccess, noop );

export default {
	[ GUTENBERG_SITE_POST_REQUEST ]: [ dispatchSitePostRequest ],
};
