/** @format */
/***
 * External dependencies
 */
import {
	filter,
	find,
	findLast,
	flatMap,
	get,
	groupBy,
	keyBy,
	map,
	mapValues,
	partition,
	pickBy,
	size,
	sortBy,
} from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { fetchStatusInitialState } from './reducer';
import { getStateKey, deconstructStateKey } from './utils';

/***
 * Gets comment items for post
 * @param {Object} state redux state
 * @param {Number} siteId site identification
 * @param {Number} postId site identification
 * @return {Array} comment items
 */
export const getPostCommentItems = ( state, siteId, postId ) =>
	get( state.comments.items, `${ siteId }-${ postId }` );

export const getDateSortedPostComments = createSelector(
	( state, siteId, postId, comments ) => {
		return sortBy( comments, comment => new Date( comment.date ) );
	},
	( state, siteId, postId ) => getPostCommentItems( state, siteId, postId )
);

export const getCommentById = createSelector(
	( { state, commentId, siteId } ) => {
		if ( get( state, 'comments.errors', {} )[ `${ siteId }-${ commentId }` ] ) {
			return state.comments.errors[ `${ siteId }-${ commentId }` ];
		}

		const commentsForSite = flatMap(
			filter( state.comments && state.comments.items, ( comment, key ) => {
				return deconstructStateKey( key ).siteId === siteId;
			} )
		);
		return find( commentsForSite, comment => commentId === comment.ID );
	},
	( { state } ) => [
		state.comments.items,
		get( state.comments, 'items' ),
		get( state.comments, 'errors' ),
	]
);
/***
 * Get total number of comments on the server for a given post
 * @param {Object} state redux state
 * @param {Number} siteId site identification
 * @param {Number} postId site identification
 * @return {Number} total comments count on the server. if not found, assume infinity
 */
export const getPostTotalCommentsCount = ( state, siteId, postId ) =>
	get( state.comments.totalCommentsCount, `${ siteId }-${ postId }` );
/***
 * Get most recent comment date for a given post
 * @param {Object} state redux state
 * @param {Number} siteId site identification
 * @param {Number} postId site identification
 * @return {Date} most recent comment date
 */
export const getPostNewestCommentDate = createSelector(
	( state, siteId, postId, items ) => {
		const firstContiguousComment = find( items, 'contiguous' );
		return firstContiguousComment ? new Date( get( firstContiguousComment, 'date' ) ) : undefined;
	},
	( state, siteId, postId ) => getPostCommentItems( state, siteId, postId )
);

/***
 * Get oldest comment date for a given post
 * @param {Object} state redux state
 * @param {Number} siteId site identification
 * @param {Number} postId site identification
 * @return {Date} earliest comment date
 */
export const getPostOldestCommentDate = createSelector(
	( state, siteId, postId, items ) => {
		const lastContiguousComment = findLast( items, 'contiguous' );
		return lastContiguousComment ? new Date( get( lastContiguousComment, 'date' ) ) : undefined;
	},
	( state, siteId, postId ) => getPostCommentItems( state, siteId, postId )
);

/***
 * Gets comment tree for a given post
 * @param {Object} state redux state
 * @param {Number} siteId site identification
 * @param {Number} postId site identification
 * @param {String} status String representing the comment status to show. Defaults to 'approved'.
 * @return {Object} comments tree, and in addition a children array
 */
export const getPostCommentsTree = createSelector(
	( state, siteId, postId, status = 'approved', allItems ) => {
		const items =
			status !== 'all'
				? filter( allItems, item => item.isPlaceholder || item.status === status )
				: allItems;

		// separate out root comments from comments that have parents
		const [ roots, children ] = partition( items, item => item.parent === false );

		// group children by their parent ID
		const childrenGroupedByParent = groupBy( children, 'parent.ID' );

		// Generate a new map of parent ID to an array of chilren IDs
		// Reverse the order to keep it in chrono order
		const parentToChildIdMap = mapValues( childrenGroupedByParent, _children =>
			map( _children, 'ID' ).reverse()
		);

		// convert all of the comments to comment nodes for our tree structure
		const transformItemToNode = item => ( {
			data: item,
			children: parentToChildIdMap[ item.ID ] || [],
		} );

		const commentsByIdMap = keyBy( map( items, transformItemToNode ), 'data.ID' );

		return {
			...commentsByIdMap,
			children: map( roots, root => root.ID ).reverse(),
		};
	},
	( state, siteId, postId ) => getPostCommentItems( state, siteId, postId )
);

export const getExpansionsForPost = ( state, siteId, postId ) =>
	state.comments.expansions[ getStateKey( siteId, postId ) ];

export const getHiddenCommentsForPost = createSelector(
	( state, siteId, postId, [ postCommentItems, expanded ] ) => {
		const comments = keyBy( postCommentItems, 'ID' );

		return pickBy( comments, comment => ! get( expanded, comment.ID ) );
	},
	( state, siteId, postId ) => [
		getPostCommentItems( state, siteId, postId ),
		getExpansionsForPost( state, siteId, postId ),
	]
);

export const commentsFetchingStatus = ( state, siteId, postId, commentTotal = 0 ) => {
	const fetchStatus = get(
		state.comments.fetchStatus,
		getStateKey( siteId, postId ),
		fetchStatusInitialState
	);
	const hasMoreComments = commentTotal > size( getPostCommentItems( state, siteId, postId ) );

	return {
		haveEarlierCommentsToFetch: fetchStatus.before && hasMoreComments,
		haveLaterCommentsToFetch: fetchStatus.after && hasMoreComments,
		hasReceivedBefore: fetchStatus.hasReceivedBefore,
		hasReceivedAfter: fetchStatus.hasReceivedAfter,
	};
};

/***
 * Gets likes stats for the comment
 * @param {Object} state redux state
 * @param {Number} siteId site identification
 * @param {Number} postId site identification
 * @param {Number} commentId comment identification
 * @return {Object} that has i_like and like_count props
 */
export const getCommentLike = createSelector( ( state, siteId, postId, commentId ) => {
	const items = getPostCommentItems( state, siteId, postId );
	const comment = find( items, { ID: commentId } );

	if ( ! comment ) {
		return undefined;
	}
	const { i_like, like_count } = comment;
	return { i_like, like_count };
}, state => state.comments.items );
