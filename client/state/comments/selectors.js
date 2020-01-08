/***
 * External dependencies
 */
import {
	isDate,
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
import treeSelect from '@automattic/tree-select';
import { fetchStatusInitialState } from './reducer';
import { getStateKey, deconstructStateKey, getErrorKey } from './utils';

/***
 * Gets comment items for post
 * @param {object} state redux state
 * @param {number} siteId site identification
 * @param {number} postId site identification
 * @returns {Array} comment items
 */
export const getPostCommentItems = ( state, siteId, postId ) =>
	get( state.comments.items, `${ siteId }-${ postId }` );

export const getDateSortedPostComments = treeSelect(
	( state, siteId, postId ) => [ getPostCommentItems( state, siteId, postId ) ],
	( [ comments ] ) => {
		return sortBy( comments, comment => new Date( comment.date ) );
	}
);

export const getCommentById = ( { state, commentId, siteId } ) => {
	const errorKey = getErrorKey( siteId, commentId );
	if ( get( state, 'comments.errors', {} )[ errorKey ] ) {
		return state.comments.errors[ errorKey ];
	}

	const commentsForSite = flatMap(
		filter( get( state, 'comments.items', [] ), ( comment, key ) => {
			return deconstructStateKey( key ).siteId === siteId;
		} )
	);
	return find( commentsForSite, comment => commentId === comment.ID );
};

export const getCommentErrors = state => {
	return state.comments.errors;
};

/***
 * Get total number of comments on the server for a given post
 * @param {object} state redux state
 * @param {number} siteId site identification
 * @param {number} postId site identification
 * @returns {number} total comments count on the server. if not found, assume infinity
 */
export const getPostTotalCommentsCount = ( state, siteId, postId ) =>
	get( state.comments.totalCommentsCount, `${ siteId }-${ postId }` );

/***
 * Get total number of comments in state at a given date and time
 *
 * @param {object} state redux state
 * @param {number} siteId site identification
 * @param {number} postId site identification
 * @param {Date} date Date to count comments for
 * @returns {number} total comments count in state
 */
export const getPostCommentsCountAtDate = ( state, siteId, postId, date ) => {
	// Check the provided date
	if ( ! isDate( date ) ) {
		return 0;
	}

	const stateKey = getStateKey( siteId, postId );
	const postComments = get( state.comments.items, stateKey );

	if ( ! postComments ) {
		return 0;
	}

	// Count post comments with the specified date
	const dateTimestamp = date.getTime() / 1000;
	const postCommentsAtDate = filter( postComments, postComment => {
		return Date.parse( postComment.date ) / 1000 === dateTimestamp;
	} );

	return size( postCommentsAtDate );
};

/***
 * Get most recent comment date for a given post
 * @param {object} state redux state
 * @param {number} siteId site identification
 * @param {number} postId site identification
 * @returns {Date} most recent comment date
 */
export const getPostNewestCommentDate = treeSelect(
	( state, siteId, postId ) => [ getPostCommentItems( state, siteId, postId ) ],
	( [ comments ] ) => {
		const firstContiguousComment = find( comments, 'contiguous' );
		return firstContiguousComment ? new Date( get( firstContiguousComment, 'date' ) ) : undefined;
	}
);

/***
 * Get oldest comment date for a given post
 * @param {object} state redux state
 * @param {number} siteId site identification
 * @param {number} postId site identification
 * @returns {Date} earliest comment date
 */
export const getPostOldestCommentDate = treeSelect(
	( state, siteId, postId ) => [ getPostCommentItems( state, siteId, postId ) ],
	( [ comments ] ) => {
		const lastContiguousComment = findLast( comments, 'contiguous' );
		return lastContiguousComment ? new Date( get( lastContiguousComment, 'date' ) ) : undefined;
	}
);

/***
 * Gets comment tree for a given post
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
		const items = filter( allItems, item => {
			//only return pending comments that match the comment author
			const commentAuthorId = get( item, 'author.ID' );
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
	}
);

export const getExpansionsForPost = ( state, siteId, postId ) =>
	state.comments.expansions[ getStateKey( siteId, postId ) ];

export const getHiddenCommentsForPost = treeSelect(
	( state, siteId, postId ) => [
		getPostCommentItems( state, siteId, postId ),
		getExpansionsForPost( state, siteId, postId ),
	],
	( [ comments, expanded ] ) => {
		const commentsById = keyBy( comments, 'ID' );

		return pickBy( commentsById, comment => ! get( expanded, comment.ID ) );
	}
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
 * @param {object} state redux state
 * @param {number} siteId site identification
 * @param {number} postId site identification
 * @param {number} commentId comment identification
 * @returns {object} that has i_like and like_count props
 */
export const getCommentLike = treeSelect(
	( state, siteId, postId ) => [ getPostCommentItems( state, siteId, postId ) ],
	( [ comments ], siteId, postId, commentId ) => {
		const comment = find( comments, { ID: commentId } );

		if ( ! comment ) {
			return undefined;
		}
		const { i_like, like_count } = comment;
		return { i_like, like_count };
	}
);
