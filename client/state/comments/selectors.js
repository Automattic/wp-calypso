/** @format */
/**
 * External dependencies
 */
import { filter, find, get, keyBy, last, first, map, size, flatMap, sortBy, pickBy } from 'lodash';

/**
 * Internal dependencies
 */
import { getStateKey, deconstructStateKey, fetchStatusInitialState } from './reducer';
import createSelector from 'lib/create-selector';

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
	state => [ state.comments.items ]
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
export const getPostMostRecentCommentDate = createSelector( ( state, siteId, postId ) => {
	const items = getPostCommentItems( state, siteId, postId );
	return items && first( items ) ? new Date( get( first( items ), 'date' ) ) : undefined;
}, state => state.comments.items );

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
}, state => state.comments.items );

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
	state => state.comments.items
);

export const getExpansionsForPost = ( state, siteId, postId ) =>
	state.comments.expansions[ getStateKey( siteId, postId ) ];

export const getHiddenCommentsForPost = createSelector(
	( state, siteId, postId ) => {
		const comments = keyBy( getPostCommentItems( state, siteId, postId ), 'ID' );
		const expanded = getExpansionsForPost( state, siteId, postId );

		return pickBy( comments, comment => ! get( expanded, comment.ID ) );
	},
	state => [ state.comments.items, state.comments.expansions ]
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
