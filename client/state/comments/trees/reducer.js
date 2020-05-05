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

const convertToTree = ( comments ) =>
	map(
		reject( comments, ( { ID } ) => ! parseInt( ID, 10 ) ),
		( comment ) => ( {
			commentId: get( comment, 'ID' ),
			commentParentId: get( comment, 'parent.ID', 0 ),
			postId: get( comment, 'post.ID' ),
			status: get( comment, 'status' ),
			type: get( comment, 'type', 'comment' ),
		} )
	);

const siteTree = ( state = [], action ) => {
	switch ( action.type ) {
		case COMMENTS_CHANGE_STATUS:
			// Update the comment status in the state
			return map( state, ( comment ) => {
				if ( comment.commentId === action.commentId ) {
					return {
						...comment,
						status: action.status,
					};
				}
				return comment;
			} );
		case COMMENTS_DELETE:
			// Remove the comment from the state
			return reject( state, { commentId: action.commentId } );
		case COMMENTS_RECEIVE:
			// Add the new comments to the state
			return unionBy( convertToTree( action.comments ), state, 'commentId' );
		case COMMENTS_TREE_SITE_ADD:
			// Replace the comments of a given status with the comments freshly fetched from the server
			return unionBy( action.tree, reject( state, { status: action.status } ), 'commentId' );
	}
	return state;
};

const trees = keyedReducer( 'siteId', siteTree );

export default trees;
