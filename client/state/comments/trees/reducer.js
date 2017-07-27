/**
 * External dependencies
 */
import { map, reject, unionBy } from 'lodash';

/**
 * Internal dependencies
 */
import {
	COMMENTS_CHANGE_STATUS,
	COMMENTS_DELETE,
	COMMENTS_TREE_SITE_ADD,
} from 'state/action-types';
import { keyedReducer } from 'state/utils';

const siteTree = ( state = [], action ) => {
	switch ( action.type ) {
		case COMMENTS_CHANGE_STATUS:
			return map( state, comment => {
				if ( comment.commentId === action.commentId ) {
					return {
						...comment,
						status: action.status,
					};
				}
				return comment;
			} );
		case COMMENTS_DELETE:
			return reject( state, { commentId: action.commentId } );
		case COMMENTS_TREE_SITE_ADD:
			return unionBy( action.tree, state, 'commentId' );
	}
	return state;
};

const trees = keyedReducer( 'siteId', siteTree );

export default trees;
