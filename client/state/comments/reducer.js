/** @format */
/**
 * External dependencies
 */
import {
	isUndefined,
	orderBy,
	has,
	map,
	unionBy,
	reject,
	isEqual,
	get,
	zipObject,
	includes,
	isArray,
	values,
	omit,
	startsWith,
	isInteger,
} from 'lodash';

/**
 * Internal dependencies
 */
import {
	COMMENT_COUNTS_UPDATE,
	COMMENTS_CHANGE_STATUS,
	COMMENTS_EDIT,
	COMMENTS_RECEIVE,
	COMMENTS_DELETE,
	COMMENTS_RECEIVE_ERROR,
	COMMENTS_COUNT_INCREMENT,
	COMMENTS_COUNT_RECEIVE,
	COMMENTS_LIKE,
	COMMENTS_UNLIKE,
	COMMENTS_TREE_SITE_ADD,
	COMMENTS_WRITE_ERROR,
	READER_EXPAND_COMMENTS,
	COMMENTS_SET_ACTIVE_REPLY,
} from 'state/action-types';
import { combineReducers, createReducer, keyedReducer } from 'state/utils';
import {
	PLACEHOLDER_STATE,
	NUMBER_OF_COMMENTS_PER_FETCH,
	POST_COMMENT_DISPLAY_TYPES,
} from './constants';
import trees from './trees/reducer';
import { getStateKey, getErrorKey, commentHasLink } from './utils';

const getCommentDate = ( { date } ) => new Date( date );

const isCommentManagementEdit = newProperties =>
	has( newProperties, 'commentContent' ) &&
	has( newProperties, 'authorDisplayName' ) &&
	has( newProperties, 'authorUrl' );

const updateComment = ( commentId, newProperties ) => comment => {
	if ( comment.ID !== commentId ) {
		return comment;
	}
	const updateLikeCount = has( newProperties, 'i_like' ) && isUndefined( newProperties.like_count );

	// Comment Management allows for modifying nested fields, such as `author.name` and `author.url`.
	// Though, there is no direct match between the GET response (which feeds the state) and the POST request.
	// This ternary matches and formats the updated fields sent by Comment Management's Edit form,
	// in order to optimistically update the state without temporary loss of information.
	const newComment = isCommentManagementEdit( newProperties )
		? {
				...comment,
				author: {
					...comment.author,
					name: newProperties.authorDisplayName,
					url: newProperties.authorUrl,
				},
				content: newProperties.commentContent,
		  }
		: { ...comment, ...newProperties };

	return {
		...newComment,
		...( updateLikeCount && {
			like_count: newProperties.i_like ? comment.like_count + 1 : comment.like_count - 1,
		} ),
	};
};

/***
 * Comments items reducer, stores a comments items Immutable.List per siteId, postId
 * @param {Object} state redux state
 * @param {Object} action redux action
 * @returns {Object} new redux state
 */
export function items( state = {}, action ) {
	const { type, siteId, postId, commentId, like_count } = action;

	// cannot construct stateKey without both
	if ( ! siteId || ! postId ) {
		return state;
	}

	const stateKey = getStateKey( siteId, postId );

	switch ( type ) {
		case COMMENTS_CHANGE_STATUS:
			const { status } = action;
			return {
				...state,
				[ stateKey ]: map( state[ stateKey ], updateComment( commentId, { status } ) ),
			};
		case COMMENTS_EDIT:
			const { comment } = action;
			return {
				...state,
				[ stateKey ]: map( state[ stateKey ], updateComment( commentId, comment ) ),
			};
		case COMMENTS_RECEIVE:
			const { skipSort } = action;
			const comments = map( action.comments, _comment => ( {
				..._comment,
				contiguous: ! action.commentById,
				has_link: commentHasLink( _comment.content, _comment.has_link ),
			} ) );
			const allComments = unionBy( state[ stateKey ], comments, 'ID' );
			return {
				...state,
				[ stateKey ]: ! skipSort ? orderBy( allComments, getCommentDate, [ 'desc' ] ) : allComments,
			};
		case COMMENTS_DELETE:
			return {
				...state,
				[ stateKey ]: reject( state[ stateKey ], { ID: commentId } ),
			};
		case COMMENTS_LIKE:
			return {
				...state,
				[ stateKey ]: map(
					state[ stateKey ],
					updateComment( commentId, { i_like: true, like_count } )
				),
			};
		case COMMENTS_UNLIKE:
			return {
				...state,
				[ stateKey ]: map(
					state[ stateKey ],
					updateComment( commentId, { i_like: false, like_count } )
				),
			};
		case COMMENTS_RECEIVE_ERROR:
		case COMMENTS_WRITE_ERROR:
			const { error, errorType } = action;
			return {
				...state,
				[ stateKey ]: map(
					state[ stateKey ],
					updateComment( commentId, {
						placeholderState: PLACEHOLDER_STATE.ERROR,
						placeholderError: error,
						placeholderErrorType: errorType,
					} )
				),
			};
	}

	return state;
}

export const fetchStatusInitialState = {
	before: true,
	after: true,
	hasReceivedBefore: false,
	hasReceivedAfter: false,
};

const isValidExpansionsAction = action => {
	const { siteId, postId, commentIds, displayType } = action.payload;
	return (
		siteId &&
		postId &&
		isArray( commentIds ) &&
		includes( values( POST_COMMENT_DISPLAY_TYPES ), displayType )
	);
};

const expansionValue = type => {
	const { full, excerpt, singleLine } = POST_COMMENT_DISPLAY_TYPES;
	switch ( type ) {
		case full:
			return 3;
		case excerpt:
			return 2;
		case singleLine:
			return 1;
	}
};

export const expansions = createReducer(
	{},
	{
		[ READER_EXPAND_COMMENTS ]: ( state, action ) => {
			const { siteId, postId, commentIds, displayType } = action.payload;

			if ( ! isValidExpansionsAction( action ) ) {
				return state;
			}

			const stateKey = getStateKey( siteId, postId );
			const currentExpansions = state[ stateKey ] || {};

			const newDisplayTypes = map( commentIds, id => {
				if (
					! has( currentExpansions, id ) ||
					expansionValue( displayType ) > expansionValue( currentExpansions[ id ] )
				) {
					return displayType;
				}
				return currentExpansions[ id ];
			} );
			// generate object of { [ commentId ]: displayType }
			const newVal = zipObject( commentIds, newDisplayTypes );

			return {
				...state,
				[ stateKey ]: Object.assign( {}, state[ stateKey ], newVal ),
			};
		},
	}
);

/***
 * Stores whether or not there are more comments, and in which directions, for a particular post.
 * Also includes whether or not a before/after has ever been queried
 * Example state:
 *  {
 *     [ siteId-postId ]: {
 *       before: bool,
 *       after: bool,
 *       hasReceivedBefore: bool,
 *       hasReceivedAfter: bool,
 *     }
 *  }
 *
 * @param {Object} state redux state
 * @param {Object} action redux action
 * @returns {Object} new redux state
 */
export const fetchStatus = createReducer(
	{},
	{
		[ COMMENTS_RECEIVE ]: ( state, action ) => {
			const { siteId, postId, direction, commentById } = action;
			const stateKey = getStateKey( siteId, postId );

			// we can't deduce anything from a commentById fetch.
			if ( commentById ) {
				return state;
			}

			const hasReceivedDirection =
				direction === 'before' ? 'hasReceivedBefore' : 'hasReceivedAfter';

			const nextState = {
				...get( state, stateKey, fetchStatusInitialState ),
				[ direction ]: action.comments.length === NUMBER_OF_COMMENTS_PER_FETCH,
				[ hasReceivedDirection ]: true,
			};

			return isEqual( state[ stateKey ], nextState )
				? state
				: { ...state, [ stateKey ]: nextState };
		},
	}
);

/***
 * Stores latest comments count for post we've seen from the server
 * @param {Object} state redux state, prev totalCommentsCount
 * @param {Object} action redux action
 * @returns {Object} new redux state
 */
export const totalCommentsCount = createReducer(
	{},
	{
		[ COMMENTS_COUNT_RECEIVE ]: ( state, action ) => {
			const key = getStateKey( action.siteId, action.postId );
			return { ...state, [ key ]: action.totalCommentsCount };
		},
		[ COMMENTS_COUNT_INCREMENT ]: ( state, action ) => {
			const key = getStateKey( action.siteId, action.postId );
			return { ...state, [ key ]: state[ key ] + 1 };
		},
	}
);

/**
 * Houses errors by `siteId-commentId`
 */
export const errors = createReducer(
	{},
	{
		[ COMMENTS_RECEIVE_ERROR ]: ( state, { siteId, commentId } ) => {
			const key = getErrorKey( siteId, commentId );

			if ( state[ key ] ) {
				return state;
			}

			return {
				...state,
				[ key ]: { error: true },
			};
		},
		[ COMMENTS_WRITE_ERROR ]: ( state, { siteId, commentId } ) => {
			const key = getErrorKey( siteId, commentId );

			if ( state[ key ] ) {
				return state;
			}

			return {
				...state,
				[ key ]: { error: true },
			};
		},
	}
);

export const treesInitializedReducer = ( state = {}, action ) => {
	if ( action.type === COMMENTS_TREE_SITE_ADD ) {
		return true;
	}
	return state;
};

export const treesInitialized = keyedReducer(
	'siteId',
	keyedReducer( 'status', treesInitializedReducer )
);

/***
 * Stores the active reply comment for a given siteId and postId
 * @param {Object} state redux state
 * @param {Object} action redux action
 * @returns {Object} new redux state
 */
export const activeReplies = createReducer(
	{},
	{
		[ COMMENTS_SET_ACTIVE_REPLY ]: ( state, action ) => {
			const { siteId, postId, commentId } = action.payload;
			const stateKey = getStateKey( siteId, postId );

			// If commentId is null, remove the key from the state map entirely
			if ( commentId === null ) {
				return omit( state, stateKey );
			}

			return { ...state, [ stateKey ]: commentId };
		},
		[ COMMENTS_WRITE_ERROR ]: ( state, action ) => {
			const { siteId, postId, parentCommentId } = action;
			const stateKey = getStateKey( siteId, postId );
			return { ...state, [ stateKey ]: parentCommentId };
		},
	}
);

function updateCount( counts, rawStatus, value = 1 ) {
	const status = rawStatus === 'unapproved' ? 'pending' : rawStatus;
	if ( ! counts || ! isInteger( counts[ status ] ) ) {
		return undefined;
	}
	const newCounts = {
		...counts,
		[ status ]: counts[ status ] + value,
	};
	const { pending, approved, spam } = newCounts;
	return {
		...newCounts,
		all: pending + approved,
		totalComments: pending + approved + spam,
	};
}

export const counts = createReducer(
	{},
	{
		[ COMMENT_COUNTS_UPDATE ]: ( state, action ) => {
			const { siteId, postId, ...commentCounts } = omit( action, 'type' );
			if ( ! siteId ) {
				return state;
			}
			const keyName = siteId && postId ? postId : 'site';
			const siteCounts = {
				[ siteId ]: Object.assign( {}, state[ siteId ] || {}, {
					[ keyName ]: commentCounts,
				} ),
			};
			return Object.assign( {}, state, siteCounts );
		},
		[ COMMENTS_CHANGE_STATUS ]: ( state, action ) => {
			const { siteId, postId = -1, status } = action;
			const previousStatus = get( action, 'meta.comment.previousStatus' );
			if ( ! siteId || ! status || ! state[ siteId ] || ! previousStatus ) {
				return state;
			}

			const { site: siteCounts, [ postId ]: postCounts } = state[ siteId ];

			//increase new status counts by one and decrement previous status counts by 1
			const newSiteCounts = updateCount( updateCount( siteCounts, status, 1 ), previousStatus, -1 );
			const newPostCounts = updateCount( updateCount( postCounts, status, 1 ), previousStatus, -1 );

			const newTotalSiteCounts = Object.assign(
				{},
				state[ siteId ],
				newSiteCounts && { site: newSiteCounts },
				newPostCounts && { [ postId ]: newPostCounts }
			);
			return Object.assign( {}, state, { [ siteId ]: newTotalSiteCounts } );
		},
		[ COMMENTS_DELETE ]: ( state, action ) => {
			const { siteId, postId = -1, commentId } = action;
			if ( commentId && startsWith( commentId, 'placeholder' ) ) {
				return state;
			}
			const previousStatus = get( action, 'meta.comment.previousStatus' );

			if ( ! siteId || ! state[ siteId ] || ! previousStatus ) {
				return state;
			}
			const { site: siteCounts, [ postId ]: postCounts } = state[ siteId ];

			const newSiteCounts = updateCount( siteCounts, previousStatus, -1 );
			const newPostCounts = updateCount( postCounts, previousStatus, -1 );

			const newTotalSiteCounts = Object.assign(
				{},
				state[ siteId ],
				newSiteCounts && { site: newSiteCounts },
				newPostCounts && { [ postId ]: newPostCounts }
			);
			return Object.assign( {}, state, { [ siteId ]: newTotalSiteCounts } );
		},
		[ COMMENTS_RECEIVE ]: ( state, action ) => {
			if ( get( action, 'meta.comment.context' ) !== 'add' ) {
				return state;
			}
			const { siteId, postId = -1 } = action;
			if ( ! siteId || ! state[ siteId ] ) {
				return state;
			}
			const { site: siteCounts, [ postId ]: postCounts } = state[ siteId ];
			const status = get( action, [ 'comments', 0, 'status' ] );

			const newSiteCounts = updateCount( siteCounts, status, 1 );
			const newPostCounts = updateCount( postCounts, status, 1 );

			const newTotalSiteCounts = Object.assign(
				{},
				state[ siteId ],
				newSiteCounts && { site: newSiteCounts },
				newPostCounts && { [ postId ]: newPostCounts }
			);
			return Object.assign( {}, state, { [ siteId ]: newTotalSiteCounts } );
		},
	}
);

export default combineReducers( {
	counts,
	items,
	fetchStatus,
	errors,
	expansions,
	totalCommentsCount,
	trees,
	treesInitialized,
	activeReplies,
} );
