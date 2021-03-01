/**
 * External dependencies
 */
import { get, has, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { keyToString } from 'calypso/reader/post-key';

import 'calypso/state/support-articles-alternates/init';

/**
 * Whether it's currently requesting alternates for a post
 *
 * @param   {object} state           Store state
 * @param   {object} postKeySegments Post key object that should have `blogId` and `postId` keys
 * @returns {boolean}                Is it currently requesting alternates
 */
export const isRequestingSupportArticleAlternates = ( state, postKeySegments ) => {
	const postKey = keyToString( postKeySegments );

	return (
		has( state.supportArticlesAlternates.requests, [ postKey ] ) &&
		isEmpty( get( state.supportArticlesAlternates.requests, [ postKey ] ) )
	);
};

/**
 * Whether post alternates request has completed successfully
 *
 * @param   {object} state           Store state
 * @param   {object} postKeySegments Post key object that should have `blogId` and `postId` keys
 * @returns {boolean}                Has post alternates request completed successfully
 */
export const isRequestingSupportArticleAlternatesCompleted = ( state, postKeySegments ) => {
	const postKey = keyToString( postKeySegments );

	return get( state.supportArticlesAlternates.requests, [ postKey, 'completed' ], false );
};

/**
 * Whether post alternates request has failed
 *
 * @param   {object} state           Store state
 * @param   {object} postKeySegments Post key object that should have `blogId` and `postId` keys
 * @returns {boolean}                Has post alternates request failed
 */
export const isRequestingSupportArticleAlternatesFailed = ( state, postKeySegments ) => {
	const postKey = keyToString( postKeySegments );

	return get( state.supportArticlesAlternates.requests, [ postKey, 'failed' ], false );
};

/**
 * Determine if alternates should be request for a post based on the current requests state
 *
 * @param   {object} state           Store state
 * @param   {object} postKeySegments Post key object that should have `blogId` and `postId` keys
 * @returns {boolean}                Should post alternates be requested
 */
export const shouldRequestSupportArticleAlternates = ( state, postKeySegments ) => {
	const postKey = keyToString( postKeySegments );

	return ! has( state.supportArticlesAlternates.requests, [ postKey ] );
};

/**
 * Get all available post alternates state
 *
 * @param   {object} state           Store state
 * @param   {object} postKeySegments Post key object that should have `blogId` and `postId` keys
 * @returns {object?}                Post alternates
 */
export const getSupportArticleAlternates = ( state, postKeySegments ) => {
	const postKey = keyToString( postKeySegments );

	return get( state.supportArticlesAlternates.items, [ postKey ] );
};

/**
 * Get post alternates for specific locale
 *
 * @param   {object} state           Store state
 * @param   {object} postKeySegments Post key object that should have `blogId` and `postId` keys
 * @param   {string} locale          Locale slug
 * @returns {object?}                Post alternate for specific locale
 */
export const getSupportArticleAlternatesForLocale = ( state, postKeySegments, locale ) => {
	return get( getSupportArticleAlternates( state, postKeySegments ), [ locale ] );
};
