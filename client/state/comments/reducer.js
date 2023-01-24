import { withStorageKey } from '@automattic/state-utils';
import {
	filter,
	orderBy,
	has,
	map,
	reject,
	isEqual,
	get,
	includes,
	omit,
	startsWith,
} from 'lodash';
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
	COMMENTS_UPDATES_RECEIVE,
	COMMENTS_UNLIKE,
	COMMENTS_WRITE_ERROR,
	COMMENTS_SET_ACTIVE_REPLY,
} from 'calypso/state/action-types';
import { READER_EXPAND_COMMENTS } from 'calypso/state/reader/action-types';
import { combineReducers } from 'calypso/state/utils';
import {
	PLACEHOLDER_STATE,
	NUMBER_OF_COMMENTS_PER_FETCH,
	POST_COMMENT_DISPLAY_TYPES,
} from './constants';
import ui from './ui/reducer';
import { getStateKey, getErrorKey, commentHasLink, getCommentDate } from './utils';

const unionById = ( a = [], b = [] ) => [
	...a,
	...b.filter( ( bc ) => ! a.some( ( ac ) => ac.ID === bc.ID ) ),
];

const isCommentManagementEdit = ( newProperties ) =>
	has( newProperties, 'commentContent' ) &&
	has( newProperties, 'authorDisplayName' ) &&
	has( newProperties, 'authorUrl' );

const updateComment = ( commentId, newProperties ) => ( comment ) => {
	if ( comment.ID !== commentId ) {
		return comment;
	}
	const updateLikeCount =
		has( newProperties, 'i_like' ) && typeof newProperties.like_count === 'undefined';

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

/**
 * Comments items reducer, stores a comments items Immutable.List per siteId, postId
 *
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
		case COMMENTS_CHANGE_STATUS: {
			const { status } = action;
			return {
				...state,
				[ stateKey ]: map( state[ stateKey ], updateComment( commentId, { status } ) ),
			};
		}
		case COMMENTS_EDIT: {
			const { comment } = action;
			return {
				...state,
				[ stateKey ]: map( state[ stateKey ], updateComment( commentId, comment ) ),
			};
		}
		case COMMENTS_RECEIVE: {
			const { skipSort } = action;
			const comments = map( action.comments, ( _comment ) => ( {
				..._comment,
				contiguous: ! action.commentById,
				has_link: commentHasLink( _comment.content, _comment.has_link ),
			} ) );
			const allComments = unionById( state[ stateKey ], comments );
			return {
				...state,
				[ stateKey ]: ! skipSort ? orderBy( allComments, getCommentDate, [ 'desc' ] ) : allComments,
			};
		}
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
		case COMMENTS_WRITE_ERROR: {
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
	}

	return state;
}

/**
 * Comments pending items reducer, stores new comments per siteId and postId
 *
 * @param {Object} state redux state
 * @param {Object} action redux action
 * @returns {Object} new redux state
 */
export function pendingItems( state = {}, action ) {
	const { type, siteId, postId } = action;

	// cannot construct stateKey without both
	if ( ! siteId || ! postId ) {
		return state;
	}

	const stateKey = getStateKey( siteId, postId );

	switch ( type ) {
		case COMMENTS_UPDATES_RECEIVE: {
			const comments = map( action.comments, ( _comment ) => ( {
				..._comment,
				contiguous: ! action.commentById,
				has_link: commentHasLink( _comment.content, _comment.has_link ),
			} ) );
			const allComments = unionById( state[ stateKey ], comments );
			return {
				...state,
				[ stateKey ]: orderBy( allComments, getCommentDate, [ 'desc' ] ),
			};
		}

		case COMMENTS_RECEIVE: {
			const receivedCommentIds = map( action.comments, 'ID' );
			return {
				...state,
				[ stateKey ]: filter(
					state[ stateKey ],
					( _comment ) => ! includes( receivedCommentIds, _comment.ID )
				),
			};
		}
	}

	return state;
}

export const fetchStatusInitialState = {
	before: true,
	after: true,
	hasReceivedBefore: false,
	hasReceivedAfter: false,
};

const isValidExpansionsAction = ( action ) => {
	const { siteId, postId, commentIds, displayType } = action.payload;
	return (
		siteId &&
		postId &&
		Array.isArray( commentIds ) &&
		includes( Object.values( POST_COMMENT_DISPLAY_TYPES ), displayType )
	);
};

const expansionValue = ( type ) => {
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

export const expansions = ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_EXPAND_COMMENTS: {
			const { siteId, postId, commentIds, displayType } = action.payload;

			if ( ! isValidExpansionsAction( action ) ) {
				return state;
			}

			const stateKey = getStateKey( siteId, postId );
			const currentExpansions = state[ stateKey ] || {};

			// generate object of { [ commentId ]: displayType }
			const newVal = Object.fromEntries(
				commentIds.map( ( id ) => {
					if (
						! has( currentExpansions, id ) ||
						expansionValue( displayType ) > expansionValue( currentExpansions[ id ] )
					) {
						return [ id, displayType ];
					}
					return [ id, currentExpansions[ id ] ];
				} )
			);

			return {
				...state,
				[ stateKey ]: Object.assign( {}, state[ stateKey ], newVal ),
			};
		}
	}

	return state;
};

/**
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
export const fetchStatus = ( state = {}, action ) => {
	switch ( action.type ) {
		case COMMENTS_RECEIVE: {
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
		}
	}

	return state;
};

/**
 * Stores latest comments count for post we've seen from the server
 *
 * @param {Object} state redux state, prev totalCommentsCount
 * @param {Object} action redux action
 * @returns {Object} new redux state
 */
export const totalCommentsCount = ( state = {}, action ) => {
	switch ( action.type ) {
		case COMMENTS_COUNT_RECEIVE: {
			const key = getStateKey( action.siteId, action.postId );
			return { ...state, [ key ]: action.totalCommentsCount };
		}
		case COMMENTS_COUNT_INCREMENT: {
			const key = getStateKey( action.siteId, action.postId );
			return { ...state, [ key ]: state[ key ] + 1 };
		}
	}

	return state;
};

/**
 * Houses errors by `siteId-commentId`
 *
 * @param {Object} state redux state
 * @param {Object} action redux action
 * @returns {Object} new redux state
 */
export const errors = ( state = {}, action ) => {
	switch ( action.type ) {
		case COMMENTS_RECEIVE_ERROR: {
			const { siteId, commentId } = action;
			const key = getErrorKey( siteId, commentId );

			if ( state[ key ] ) {
				return state;
			}

			return {
				...state,
				[ key ]: { error: true },
			};
		}
		case COMMENTS_WRITE_ERROR: {
			const { siteId, commentId } = action;
			const key = getErrorKey( siteId, commentId );

			if ( state[ key ] ) {
				return state;
			}

			return {
				...state,
				[ key ]: { error: true },
			};
		}
	}

	return state;
};

/**
 * Stores the active reply comment for a given siteId and postId
 *
 * @param {Object} state redux state
 * @param {Object} action redux action
 * @returns {Object} new redux state
 */
export const activeReplies = ( state = {}, action ) => {
	switch ( action.type ) {
		case COMMENTS_SET_ACTIVE_REPLY: {
			const { siteId, postId, commentId } = action.payload;
			const stateKey = getStateKey( siteId, postId );

			// If commentId is null, remove the key from the state map entirely
			if ( commentId === null ) {
				return omit( state, stateKey );
			}

			return { ...state, [ stateKey ]: commentId };
		}
		case COMMENTS_WRITE_ERROR: {
			const { siteId, postId, parentCommentId } = action;
			const stateKey = getStateKey( siteId, postId );
			return { ...state, [ stateKey ]: parentCommentId };
		}
	}

	return state;
};

function updateCount( counts, rawStatus, value = 1 ) {
	const status = rawStatus === 'unapproved' ? 'pending' : rawStatus;
	if ( ! counts || ! Number.isInteger( counts[ status ] ) ) {
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

export const counts = ( state = {}, action ) => {
	switch ( action.type ) {
		case COMMENT_COUNTS_UPDATE: {
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
		}
		case COMMENTS_CHANGE_STATUS: {
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
		}
		case COMMENTS_DELETE: {
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
		}
		case COMMENTS_RECEIVE: {
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
		}
	}

	return state;
};

const combinedReducer = combineReducers( {
	counts,
	items,
	pendingItems,
	fetchStatus,
	errors,
	expansions,
	totalCommentsCount,
	activeReplies,
	ui,
} );
const commentsReducer = withStorageKey( 'comments', combinedReducer );
export default commentsReducer;
