/** @format */
/**
 * External dependencies
 */
import { isUndefined, orderBy, has, map, unionBy, reject, isEqual, get, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import {
	COMMENTS_CHANGE_STATUS,
	COMMENTS_EDIT,
	COMMENTS_RECEIVE,
	COMMENTS_DELETE,
	COMMENTS_ERROR,
	COMMENTS_COUNT_INCREMENT,
	COMMENTS_COUNT_RECEIVE,
	COMMENTS_LIKE,
	COMMENTS_UNLIKE,
	COMMENTS_TREE_SITE_ADD,
	READER_EXPAND_COMMENTS,
	READER_VIEW_COMMENT,
} from '../action-types';
import { combineReducers, createReducer, keyedReducer } from 'state/utils';
import { PLACEHOLDER_STATE, NUMBER_OF_COMMENTS_PER_FETCH } from './constants';
import trees from './trees/reducer';

const getCommentDate = ( { date } ) => new Date( date );

export const getStateKey = ( siteId, id ) => `${ siteId }-${ id }`;

export const deconstructStateKey = key => {
	const [ siteId, postId ] = key.split( '-' );
	return { siteId: +siteId, postId: +postId };
};

const updateComment = ( commentId, newProperties ) => comment => {
	if ( comment.ID !== commentId ) {
		return comment;
	}
	const updateLikeCount = has( newProperties, 'i_like' ) && isUndefined( newProperties.like_count );

	return {
		...comment,
		...newProperties,
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
			const { content } = action;
			return {
				...state,
				[ stateKey ]: map( state[ stateKey ], updateComment( commentId, { content } ) ),
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

items.hasCustomPersistence = true;

export const fetchStatusInitialState = {
	before: true,
	after: true,
	hasReceivedBefore: false,
	hasReceivedAfter: false,
};

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

export const commentWatermarkSchema = {
	type: 'object',
	patternProperties: {
		//be careful to escape regexes properly
		'd+-d+': { type: 'object' },
	},
};

/**
 *  For each post on each site, contains the last scene comment in convo tool
 */
export const watermark = createReducer(
	{},
	{
		[ READER_VIEW_COMMENT ]: ( state, action ) => {
			const { siteId, postId, date, commentId } = action.payload;
			const stateKey = getStateKey( siteId, postId );

			if ( state[ stateKey ] && new Date( state[ stateKey ].date ) > new Date( date ) ) {
				return state;
			}

			return {
				...state,
				[ stateKey ]: { date, commentId },
			};
		},
	},
	commentWatermarkSchema
);

export const expansions = createReducer(
	{},
	{
		[ READER_EXPAND_COMMENTS ]: ( state, action ) => {
			const { siteId, postId, commentIds, displayType } = action.payload;
			const stateKey = getStateKey( siteId, postId );
			const newVal = reduce(
				commentIds,
				( accum, id ) => {
					accum[ id ] = displayType;
					return accum;
				},
				{}
			);

			return {
				...state,
				[ stateKey ]: Object.assign( {}, state[ stateKey ], newVal ),
			};
		},
		[ READER_VIEW_COMMENT ]: ( state, action ) => {
			const { siteId, postId, commentId } = action.payload;
			const stateKey = getStateKey( siteId, postId );

			if ( has( state, `${ stateKey }.${ commentId }` ) ) {
				return state;
			}

			return {
				...state,
				[ stateKey ]: Object.assign( {}, state[ stateKey ], { [ commentId ]: 'is-excerpt' } ),
			};
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
	expansions,
	items,
	fetchStatus,
	errors,
	totalCommentsCount,
	trees,
	treesInitialized,
	watermark,
} );
