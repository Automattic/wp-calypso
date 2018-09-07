/** @format */
/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { GUTENBERG_SITE_POST_RECEIVE } from 'state/action-types';
import { combineReducers, createReducer } from 'state/utils';

/***
 * Posts items reducer, stores a comments items Immutable.List per siteId, postId
 * @param {Object} state redux state
 * @param {Object} action redux action
 * @returns {Object} new redux state
 */
export const currentPost = createReducer(
	{},
	{
		[ GUTENBERG_SITE_POST_RECEIVE ]: ( state, { post } ) => post,
	}
);

export default combineReducers( { currentPost } );
