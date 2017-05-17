/***
 * External dependencies
 */
import { filter, find, get, keyBy, map, size, maxBy, minBy } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

/***
 * Gets comment items for post
 * @param {Object} state redux state
 * @param {Number} siteId site identification
 * @param {Number} postId site identification
 * @return {Immutable.List} comment items
 */
export const getPostCommentItems = ( state, siteId, postId ) => get( state.comments.items, `${ siteId }-${ postId }` );

/***
 * Get requests status map for post
 * @param {Object} state redux state
 * @param {Number} siteId site identification
 * @param {Number} postId site identification
 * @return {Immutable.Map<RequestId, ActionType>} map of requestIds to status
 */
export const getPostCommentRequests = ( state, siteId, postId ) => get( state.comments.requests, `${ siteId }-${ postId }` );

/***
 * Get total number of comments on the server for a given post
 * @param {Object} state redux state
 * @param {Number} siteId site identification
 * @param {Number} postId site identification
 * @return {Number} total comments count on the server
 */
export const getPostTotalCommentsCount = ( state, siteId, postId ) => get( state.comments.totalCommentsCount, `${ siteId }-${ postId }` );
/***
 * Get most recent comment date for a given post
 * @param {Object} state redux state
 * @param {Number} siteId site identification
 * @param {Number} postId site identification
 * @return {Date} most recent comment date
 */
export const getPostMostRecentCommentDate = createSelector(
	( state, siteId, postId ) => {
		const items = filter( getPostCommentItems( state, siteId, postId ), { parent: false } );
		const newestComment = maxBy( items, item => new Date( item.date ) );
		return newestComment ? new Date( newestComment.date ) : undefined;
	},
	getPostCommentItems
);

/***
 * Get most old (earliest) comment date for a given post
 * @param {Object} state redux state
 * @param {Number} siteId site identification
 * @param {Number} postId site identification
 * @return {Date} earliest comment date
 */
export const getPostOldestCommentDate = createSelector(
	( state, siteId, postId ) => {
		const items = filter( getPostCommentItems( state, siteId, postId ), { parent: false } );
		const oldestComment = minBy( items, item => new Date( item.date ) );
		return oldestComment ? new Date( oldestComment.date ) : undefined;
	},
	getPostCommentItems
);

/***
 * Gets comment tree for a given post
 * @param {Object} state redux state
 * @param {Number} siteId site identification
 * @param {Number} postId site identification
 * @param {String} status String representing the comment status to show. Defaults to 'all'.
 * @return {Object} comments tree in the form of immutable map<CommentId, CommentNode>, and in addition a children array
 */
export const getPostCommentsTree = createSelector(
	( state, siteId, postId, status ) => {
		const allItems = getPostCommentItems( state, siteId, postId );
		const items = status !== 'all' ? filter( allItems, { status } ) : allItems;

		return {
			...keyBy( map( items, item => ( {
				children: map( filter( items, { parent: { ID: item.ID } } ), 'ID' ),
				data: item
			} ) ), 'data.ID' ),
			children: map( filter( items, { parent: false } ), 'ID' )
		};
	},
	getPostCommentItems
);

/***
 * Whether we have more comments to fetch for a given post
 * @param {Object} state redux state
 * @param {Number} siteId site identification
 * @param {Number} postId site identification
 * @return {Boolean} do we have more comments to fetch
 */
export const haveMoreCommentsToFetch = createSelector(
	( state, siteId, postId ) => {
		const items = getPostCommentItems( state, siteId, postId );
		const totalCommentsCount = getPostTotalCommentsCount( state, siteId, postId );
		return items && totalCommentsCount ? size( items ) < totalCommentsCount : undefined;
	},
	( state, siteId, postId ) => [ getPostCommentItems( state, siteId, postId ), getPostTotalCommentsCount( state, siteId, postId ) ]
);

/***
 * Gets likes stats for the comment
 * @param {Object} state redux state
 * @param {Number} siteId site identification
 * @param {Number} postId site identification
 * @param {Number} commentId comment identification
 * @return {Immutable.Map} that has i_like and like_count props
 */
export const getCommentLike = createSelector(
	( state, siteId, postId, commentId ) => {
		const items = getPostCommentItems( state, siteId, postId );
		const comment = find( items, { ID: commentId } );

		if ( ! comment ) {
			return undefined;
		}
		const { i_like, like_count } = comment;
		return { i_like, like_count };
	},
	getPostCommentItems
);
