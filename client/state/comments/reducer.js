/** @format */
/**
 * External dependencies
 */
import { isUndefined, orderBy, has, map, unionBy, reject, isEqual, get, zipObject, includes, isArray, values } from 'lodash';

/**
 * Internal dependencies
 */
import { COMMENTS_CHANGE_STATUS, COMMENTS_EDIT, COMMENTS_RECEIVE, COMMENTS_DELETE, COMMENTS_ERROR, COMMENTS_COUNT_INCREMENT, COMMENTS_COUNT_RECEIVE, COMMENTS_LIKE, COMMENTS_UNLIKE, COMMENTS_TREE_SITE_ADD, READER_EXPAND_COMMENTS } from '../action-types';
import { PLACEHOLDER_STATE, NUMBER_OF_COMMENTS_PER_FETCH, POST_COMMENT_DISPLAY_TYPES } from './constants';
import trees from './trees/reducer';
import { combineReducers, createReducer, keyedReducer } from 'state/utils';

const getCommentDate = ( { date } ) => new Date( date );

export const getStateKey = ( siteId, postId ) => `${ siteId }-${ postId }`;

export const deconstructStateKey = key => {
	const [ siteId, postId ] = key.split( '-' );
	return { siteId: +siteId, postId: +postId };
};

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
			const { skipSort, comments } = action;
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
		case COMMENTS_ERROR:
			const { error } = action;
			return {
				...state,
				[ stateKey ]: map(
					state[ stateKey ],
					updateComment( commentId, {
						placeholderState: PLACEHOLDER_STATE.ERROR,
						placeholderError: error,
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
		[ COMMENTS_ERROR ]: ( state, action ) => {
			const key = `${ action.siteId }-${ action.commentId }`;

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

export default combineReducers( {
	items,
	fetchStatus,
	errors,
	expansions,
	totalCommentsCount,
	trees,
	treesInitialized,
} );
