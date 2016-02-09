/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	POST_EDITOR_EDIT,
	POST_EDITOR_START,
	POSTS_RECEIVE
} from 'state/action-types';

function currentPostGlobalId( state = null, action ) {
	switch ( action.type ) {
		case POST_EDITOR_START:
			const { globalId, siteId, postId } = action;
			if ( globalId ) {
				return globalId;
			}

			if ( ! postId ) {
				return 'NEW_' + siteId;
			}

			return [ siteId, postId ];

		case POSTS_RECEIVE:
			if ( ! Array.isArray( state ) ) {
				return state;
			}

			const post = find( action.posts, {
				site_ID: state[ 0 ],
				post_ID: state[ 1 ]
			} );

			if ( post ) {
				return post.global_ID;
			}
	}

	return state;
}

function posts( state = {}, action ) {
	switch ( action.type ) {
		case POST_EDITOR_EDIT:
			const { globalId, post } = action;
			return Object.assign( {}, state, {
				[ globalId ]: Object.assign( {}, state[ globalId ], post )
			} );
	}

	return state;
}

export default combineReducers( {
	currentPostGlobalId,
	posts
} );
