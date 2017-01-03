/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { merge } from 'lodash';

/**
 * Internal dependencies
 */
import itemsSchema from './schema';
import { createReducer } from 'state/utils';
import {
	POST_LIKES_RECEIVE,
	POST_LIKES_REQUEST,
	POST_LIKES_REQUEST_SUCCESS,
	POST_LIKES_REQUEST_FAILURE
} from 'state/action-types';

/**
 * Returns the updated requests state after an action has been dispatched. The
 * state maps site ID, post ID keys to whether a request for post likes is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const requesting = createReducer( {}, {
	[ POST_LIKES_REQUEST ]: ( state, { siteId, postId } ) => merge( {}, state, {
		[ siteId ]: {
			[ postId ]: true
		}
	} ),
	[ POST_LIKES_REQUEST_SUCCESS ]: ( state, { siteId, postId } ) => merge( {}, state, {
		[ siteId ]: {
			[ postId ]: false
		}
	} ),
	[ POST_LIKES_REQUEST_FAILURE ]: ( state, { siteId, postId } ) => merge( {}, state, {
		[ siteId ]: {
			[ postId ]: false
		}
	} ),
} );

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID, post ID keys to the the post's likes.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const items = createReducer( {}, {
	[ POST_LIKES_RECEIVE ]: ( state, { siteId, postId, likes, iLike, found } ) => {
		return {
			...state,
			[ siteId ]: {
				...state[ siteId ],
				[ postId ]: { likes, iLike, found }
			}
		};
	}
}, itemsSchema );

export default combineReducers( {
	requesting,
	items
} );
