/** @format */

/**
 * External dependencies
 */

import { filter, get, isEmpty, isInteger, keyBy, merge } from 'lodash';

/**
 * Internal dependencies
 */
import {
	POST_EDIT,
	POST_REVISIONS_RECEIVE,
	POST_REVISIONS_REQUEST,
	POST_REVISIONS_REQUEST_FAILURE,
	POST_REVISIONS_REQUEST_SUCCESS,
	POST_REVISIONS_SELECT,
	POST_REVISIONS_DIALOG_CLOSE,
	POST_REVISIONS_DIALOG_OPEN,
	SELECTED_SITE_SET,
} from 'state/action-types';
import { combineReducers, createReducer } from 'state/utils';
import { revisionsDiffSchema } from './schemas.js';

const isNonNegativeInteger = t => isInteger( t ) && t >= 0;
const isPositiveInteger = t => isInteger( t ) && t > 0;

export const diffs = createReducer(
	{},
	{
		[ POST_REVISIONS_RECEIVE ]: (
			state,
			{ diffs: diffsFromServer, postId, revisions, siteId }
		) => {
			if ( ! isPositiveInteger( siteId ) ) {
				return state;
			}
			const filteredDiffs = filter(
				diffsFromServer,
				d => isNonNegativeInteger( d.from ) && isNonNegativeInteger( d.to ) && ! isEmpty( d.diff )
			);
			const keyedDiffs = keyBy( filteredDiffs, d => `${ d.from }:${ d.to }` );

			if ( isEmpty( keyedDiffs ) ) {
				return state;
			}

			const sitePost = get( state, [ siteId, postId ], {} );
			// @TODO support merging a unique set
			sitePost.revisions = revisions;

			return {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					[ postId ]: {
						...sitePost,
						...keyedDiffs,
					},
				},
			};
		},
	},
	revisionsDiffSchema
);

export function requesting( state = {}, action ) {
	switch ( action.type ) {
		case POST_REVISIONS_REQUEST:
		case POST_REVISIONS_REQUEST_FAILURE:
		case POST_REVISIONS_REQUEST_SUCCESS:
			return merge( {}, state, {
				[ action.siteId ]: {
					[ action.postId ]: action.type === POST_REVISIONS_REQUEST,
				},
			} );
	}

	return state;
}

export function selection( state = {}, action ) {
	switch ( action.type ) {
		case POST_REVISIONS_SELECT: {
			return { ...state, revisionId: action.revisionId };
		}
		case POST_EDIT:
		case SELECTED_SITE_SET: {
			return { ...state, revisionId: null };
		}
		default:
			return state;
	}
}

export function ui( state = {}, action ) {
	switch ( action.type ) {
		case POST_REVISIONS_DIALOG_CLOSE:
			return { ...state, isDialogVisible: false };
		case POST_REVISIONS_DIALOG_OPEN:
			return { ...state, isDialogVisible: true };
		default:
			return state;
	}
}

export default combineReducers( {
	diffs,
	requesting,
	selection,
	ui,
} );
