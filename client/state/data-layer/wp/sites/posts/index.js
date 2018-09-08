/** @format */

/**
 * Internal dependencies
 */
import { GUTENBERG_CREATE_POST_DRAFT, GUTENBERG_SITE_POST_REQUEST } from 'state/action-types';
import { dispatchRequest /*, getHeaders*/ } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice } from 'state/notices/actions';
import { requestSitePost, receiveSitePost } from 'state/gutenberg/actions';

/**
 * Dispatches a request to create a new post draft
 * to load into Gutenberg
 *
 * @param {Function} dispatch Redux dispatcher
 * @param {Object} action Redux action
 */
export const requestGutenbergPostDraft = ( { dispatch }, action ) => {
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

export const createSitePostSuccess = ( { dispatch }, { siteId }, { ID: postId } ) =>
	dispatch( requestSitePost( siteId, postId ) );

export const fetchSitePostSuccess = ( { dispatch }, { siteId, postId }, post ) =>
	dispatch( receiveSitePost( siteId, postId, post ) );

export const handleRequestFailure = ( { dispatch } ) =>
	dispatch( errorNotice( 'Could not load this post' ) );

const dispatchGutenbergPostDraft = dispatchRequest(
	requestGutenbergPostDraft,
	createSitePostSuccess,
	handleRequestFailure
);

const dispatchSitePostRequest = dispatchRequest(
	fetchSitePost,
	fetchSitePostSuccess,
	handleRequestFailure
);

export default {
	[ GUTENBERG_CREATE_POST_DRAFT ]: [ dispatchGutenbergPostDraft ],
	[ GUTENBERG_SITE_POST_REQUEST ]: [ dispatchSitePostRequest ],
};
