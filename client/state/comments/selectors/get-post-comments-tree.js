/**
 * External dependencies
 */
import treeSelect from '@automattic/tree-select';
import { filter, groupBy, keyBy, map, mapValues, partition } from 'lodash';

/**
 * Internal dependencies
 */
import { getPostCommentItems } from 'state/comments/selectors/get-post-comment-items';

import 'state/comments/init';

/**
 * Gets comment tree for a given post
 *
 * @param {object} state redux state
 * @param {number} siteId site identification
 * @param {number} postId site identification
 * @param {string} status String representing the comment status to show. Defaults to 'approved'.
 * @param {number} authorId - when specified we only return pending comments that match this id
 * @returns {object} comments tree, and in addition a children array
 */
export const getPostCommentsTree = treeSelect(
	( state, siteId, postId ) => [ getPostCommentItems( state, siteId, postId ) ],
	( [ allItems ], siteId, postId, status = 'approved', authorId ) => {
		const items = filter( allItems, ( item ) => {
			//only return pending comments that match the comment author
			const commentAuthorId = item?.author?.ID;
			if (
				authorId &&
				commentAuthorId &&
				item.status === 'unapproved' &&
				commentAuthorId !== authorId
			) {
				return false;
			}
			if ( status !== 'all' ) {
				return item.isPlaceholder || item.status === status;
			}
			return true;
		} );

		// separate out root comments from comments that have parents
		const [ roots, children ] = partition( items, ( item ) => item.parent === false );

		// group children by their parent ID
		const childrenGroupedByParent = groupBy( children, 'parent.ID' );

		// Generate a new map of parent ID to an array of chilren IDs
		// Reverse the order to keep it in chrono order
		const parentToChildIdMap = mapValues( childrenGroupedByParent, ( _children ) =>
			map( _children, 'ID' ).reverse()
		);

		// convert all of the comments to comment nodes for our tree structure
		const transformItemToNode = ( item ) => ( {
			data: item,
			children: parentToChildIdMap[ item.ID ] || [],
		} );

		const commentsByIdMap = keyBy( map( items, transformItemToNode ), 'data.ID' );

		return {
			...commentsByIdMap,
			children: map( roots, ( root ) => root.ID ).reverse(),
		};
	}
);
