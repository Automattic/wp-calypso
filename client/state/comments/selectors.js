/** @format */
/***
 * External dependencies
 */
import { filter, find, get, keyBy, last, first, map, size, flatMap, sortBy, pickBy } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getStateKey, deconstructStateKey, fetchStatusInitialState } from './reducer';

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
	( state, siteId, postId ) => {
		const comments = getPostCommentItems( state, siteId, postId );
		return sortBy( comments, comment => new Date( comment.date ) );
	},
	( state, siteId, postId ) => [ get( state.comments, 'items' )[ getStateKey( siteId, postId ) ] ]
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
	( { state, commentId, siteId } ) => [
		commentId,
		siteId,
		get( state.comments, 'items' ),
		get( state.comments, 'errors' ),
	]
);

/**
 * Plan of attack:
 *
 * assumptions:
 * - all comments for a post are in state.
 *
 * reducers:
 *  - expandedComments ( full, excerpt, singleline, hidden, null)
 *  - watermark: latest seen commentId
 *
 * selectors:
 *  - getCommentsSinceComment
 *  - getCommentNeedsCaterpillar( commentid ) --> bool.  return true if any child is invisible
 *  - getNextBatchOfAuthors
 *
 * how to connect it all together:
 *  1. when displaying convo stream, dispatch to put all comments since last viewed comment 'excerpt'
 * 	 1a. this also has the effect of putting all immediate parents to singleLine and all further parents to invisible
 *  2. clicking ReadMore for any single comment will move it to 'full'
 *  3. caterpillars are shown when any child has unexpanded children?
 *
 */

export const getLatestCommentViewed = ( state, siteId, postId ) => {
	const key = getStateKey( siteId, postId );
	return get( state.comments.watermark[ key ], 'commentId' );
};

export const getAllCommentsSinceComment = createSelector(
	( state, siteId, postId, commentId ) => {
		const comment = getCommentById( { state, commentId, siteId } );
		const allSortedComments = getDateSortedPostComments( state, siteId, postId );

		if ( ! comment ) {
			return keyBy( allSortedComments, 'ID' );
		}

		const onlyNewComments = filter(
			allSortedComments,
			c => new Date( c.date ) > new Date( comment.date )
		);

		return keyBy( onlyNewComments, 'ID' );
	},
	( state, siteId, postId ) => [ get( state.comments, 'items' )[ getStateKey( siteId, postId ) ] ]
);

export const getAllCommentSinceLatestViewed = ( state, siteId, postId ) => {
	const latestViewedCommentId = getLatestCommentViewed( state, siteId, postId );
	return getAllCommentsSinceComment( state, siteId, postId, latestViewedCommentId );
};

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
export const getPostMostRecentCommentDate = createSelector( ( state, siteId, postId ) => {
	const items = getPostCommentItems( state, siteId, postId );
	return items && first( items ) ? new Date( get( first( items ), 'date' ) ) : undefined;
}, getPostCommentItems );

export const getExpansionsForPost = ( state, siteId, postId ) =>
	state.comments.expansions[ getStateKey( siteId, postId ) ];

export const getHiddenCommentsForPost = createSelector(
	( state, siteId, postId ) => {
		const comments = keyBy( getPostCommentItems( state, siteId, postId ), 'ID' );
		const expanded = getExpansionsForPost( state, siteId, postId );
		return pickBy( comments, comment => ! get( expanded, comment.ID ) );
	},
	( state, siteId, postId ) => [
		getExpansionsForPost( state, siteId, postId ),
		getPostCommentItems( state, siteId, postId ),
	]
);

export const getRootNeedsCaterpillar = ( state, siteId, postId ) =>
	size( getExpansionsForPost( state, siteId, postId ) ) !==
	size( getPostCommentItems( state, siteId, postId ) );

/***
 * Get oldest comment date for a given post
 * @param {Object} state redux state
 * @param {Number} siteId site identification
 * @param {Number} postId site identification
 * @return {Date} earliest comment date
 */
export const getPostOldestCommentDate = createSelector( ( state, siteId, postId ) => {
	const items = getPostCommentItems( state, siteId, postId );
	return items && last( items ) ? new Date( get( last( items ), 'date' ) ) : undefined;
}, state => state.comments.items );

/***
 * Get newest comment date for a given post
 * @param {Object} state redux state
 * @param {Number} siteId site identification
 * @param {Number} postId site identification
 * @return {Date} earliest comment date
 */
export const getPostNewestCommentDate = createSelector( ( state, siteId, postId ) => {
	const items = getPostCommentItems( state, siteId, postId );
	return items && first( items ) ? new Date( get( first( items ), 'date' ) ) : undefined;
}, getPostCommentItems );

/***
 * Gets comment tree for a given post
 * @param {Object} state redux state
 * @param {Number} siteId site identification
 * @param {Number} postId site identification
 * @param {String} status String representing the comment status to show. Defaults to 'approved'.
 * @return {Object} comments tree, and in addition a children array
 */
export const getPostCommentsTree = createSelector(
	( state, siteId, postId, status = 'approved' ) => {
		const allItems = getPostCommentItems( state, siteId, postId );
		const items =
			status !== 'all'
				? filter( allItems, item => item.isPlaceholder || item.status === status )
				: allItems;

		return {
			...keyBy(
				map( items, item => ( {
					children: map( filter( items, { parent: { ID: item.ID } } ), 'ID' ).reverse(),
					data: item,
				} ) ),
				'data.ID'
			),
			children: map( filter( items, { parent: false } ), 'ID' ).reverse(),
		};
	},
	state => [ state.comments.items ]
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
}, getPostCommentItems );
