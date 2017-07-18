/***
 * External dependencies
 */
import { filter, find, get, keyBy, last, first, map, size } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getStateKey, hasMoreCommentsInitialState } from './reducer';

/***
 * Gets comment items for post
 * @param {Object} state redux state
 * @param {Number} siteId site identification
 * @param {Number} postId site identification
 * @return {Array} comment items
 */
export const getPostCommentItems = ( state, siteId, postId ) =>
	get( state.comments.items, `${ siteId }-${ postId }` );

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

/***
 * Get most oldest comment date for a given post
 * @param {Object} state redux state
 * @param {Number} siteId site identification
 * @param {Number} postId site identification
 * @return {Date} earliest comment date
 */
export const getPostOldestCommentDate = createSelector( ( state, siteId, postId ) => {
	const items = getPostCommentItems( state, siteId, postId );
	return items && last( items ) ? new Date( get( last( items ), 'date' ) ) : undefined;
}, getPostCommentItems );

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
				'data.ID',
			),
			children: map( filter( items, { parent: false } ), 'ID' ).reverse(),
		};
	},
	getPostCommentItems,
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
	( state, siteId, postId ) => [
		getPostCommentItems( state, siteId, postId ),
		getPostTotalCommentsCount( state, siteId, postId ),
	],
);

export const haveEarlierCommentsToFetch = ( state, siteId, postId, commentTotal = 0 ) =>
	( haveMoreCommentsToFetch( state, siteId, postId ) ||
		commentTotal > size( getPostCommentItems( state, siteId, postId ) ) ) &&
	get( state.comments.hasMoreComments, getStateKey( siteId, postId ), hasMoreCommentsInitialState )
		.before;

export const haveLaterCommentsToFetch = ( state, siteId, postId, commentTotal = 0 ) =>
	( haveMoreCommentsToFetch( state, siteId, postId ) ||
		commentTotal > size( getPostCommentItems( state, siteId, postId ) ) ) &&
	get( state.comments.hasMoreComments, getStateKey( siteId, postId ), hasMoreCommentsInitialState )
		.after;

export const haveReceivedBeforeAndAfter = ( state, siteId, postId ) => {
	const hasMoreComments = get(
		state.comments.hasMoreComments,
		getStateKey( siteId, postId ),
		hasMoreCommentsInitialState,
	);
	const { hasReceivedAfter, hasReceivedBefore } = hasMoreComments;
	return hasReceivedBefore && hasReceivedAfter;
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
