/** @format */

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { GUTENBERG_SITE_CREATE_DRAFT, GUTENBERG_SITE_POST_REQUEST } from 'state/action-types';
import { dispatchRequest /*, getHeaders*/ } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice } from 'state/notices/actions';
import { requestSitePost, receiveSitePost } from 'state/gutenberg/actions';

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
				path: `/sites/${ siteId }/posts/${ postId }?context=edit`,
				method: 'GET',
				apiNamespace: 'wp/v2',
			},
			action
		)
	);
};

export const createSitePost = ( { dispatch }, action ) => {
	const { siteId } = action;
	dispatch(
		http(
			{
				path: `/sites/${ siteId }/posts/create-draft`,
				method: 'GET',
				apiNamespace: 'wp/v2',
			},
			action
		)
	);
};

export const createSitePostSuccess = ( { dispatch }, { siteId }, { ID: postId } ) =>
	dispatch( requestSitePost( siteId, postId ) );

export const fetchSitePostSuccess = ( { dispatch }, { siteId, postId }, post ) =>
	dispatch( receiveSitePost( siteId, postId, post ) );

export const handleRequestFailure = ( { dispatch } ) =>
	dispatch( errorNotice( 'Could not load this post' ) );

const dispatchCreateSitePost = dispatchRequest(
	createSitePost,
	createSitePostSuccess,
	handleRequestFailure
);

const dispatchSitePostRequest = dispatchRequest(
	fetchSitePost,
	fetchSitePostSuccess,
	handleRequestFailure
);

export default {
	[ GUTENBERG_SITE_CREATE_DRAFT ]: [ dispatchCreateSitePost ],
	[ GUTENBERG_SITE_POST_REQUEST ]: [ dispatchSitePostRequest ],
};
