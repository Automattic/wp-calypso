/** @format */
/**
 * Internal dependencies
 */
import {
	GUTENBERG_SITE_CREATE_DRAFT,
	GUTENBERG_SITE_POST_REQUEST,
	GUTENBERG_SITE_POST_RECEIVE,
} from 'state/action-types';

export const createDraft = siteId => ( {
	type: GUTENBERG_SITE_CREATE_DRAFT,
	siteId,
} );

/**
 * Creates an action that requests a single post for a given site using
 * the API v2.
 * @param {Number} siteId Site identifier
 * @param {Number} postId Post identifier
 * @returns {Object} Action that requests a single post
 */
export const requestSitePost = ( siteId, postId ) => ( {
	type: GUTENBERG_SITE_POST_REQUEST,
	siteId,
	postId,
} );

/**
 * Creates an action for receiving a specific post on a site.
 * @param {Number} siteId site identifier
 * @param {Number} postId post identifier
 * @param {Object} post post received
 * @returns {Object} Action for receiving a post
 */
export const receiveSitePost = ( siteId, postId, post ) => ( {
	type: GUTENBERG_SITE_POST_RECEIVE,
	siteId,
	postId,
	post,
} );
