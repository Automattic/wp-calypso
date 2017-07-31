/**
 * External dependencies
 */
import { get, map, reject, unionBy } from 'lodash';

/**
 * Internal dependencies
 */
import {
	COMMENTS_CHANGE_STATUS,
	COMMENTS_DELETE,
	COMMENTS_RECEIVE,
	COMMENTS_TREE_SITE_ADD,
} from 'state/action-types';
import { keyedReducer } from 'state/utils';

const convertToTree = comments => map(
	reject( comments, ( { ID } ) => ! parseInt( ID, 10 ) ),
	comment => ( {
		commentId: get( comment, 'ID' ),
		commentParentId: get( comment, 'parent.ID', 0 ),
		postId: get( comment, 'post.ID' ),
		status: get( comment, 'status' ),
	} )
);

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
		case COMMENTS_RECEIVE:
			return unionBy( convertToTree( action.comments ), state, 'commentId' );
		case COMMENTS_TREE_SITE_ADD:
			return unionBy( action.tree, reject( state, { status: action.status } ), 'commentId' );
	}
	return state;
};

const trees = keyedReducer( 'siteId', siteTree );

export default trees;
