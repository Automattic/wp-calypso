/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	COMMENTS_RECEIVE,
	COMMENTS_COUNT_RECEIVE,
	COMMENTS_REQUEST,
	COMMENTS_REQUEST_SUCCESS,
	COMMENTS_REQUEST_FAILURE,
	COMMENTS_LIKE,
	COMMENTS_LIKE_UPDATE,
	COMMENTS_UNLIKE,
	COMMENTS_REMOVE,
	COMMENTS_ERROR
} from '../action-types';
import {
	createRequestId
} from './utils';
import {
	getPostOldestCommentDate,
	getPostCommentRequests
} from './selectors';
import {
	NUMBER_OF_COMMENTS_PER_FETCH,
	PLACEHOLDER_STATE
} from './constants';

/***
 * Internal handler for comments request success
 * @param {Object} options handler options
 * @param {Function} options.dispatch redux dispatch function
 * @param {String} options.requestId request identifier
 * @param {Number} options.siteId site identifier
 * @param {Number} options.postId post identifier
 * @param {Object[]} options.comments comments array
 * @param {Number} options.totalCommentsCount comments count that the server have on that post
 */
function commentsRequestSuccess( options ) {
	const {
		dispatch,
		requestId,
		siteId,
		postId,
		comments,
		totalCommentsCount
	} = options;

	dispatch( {
		type: COMMENTS_REQUEST_SUCCESS,
		requestId: requestId
	} );

	dispatch( {
		type: COMMENTS_RECEIVE,
		siteId: siteId,
		postId: postId,
		comments: comments
	} );

	// if the api have returned comments count, dispatch it
	// the api will produce a count only when the request has no
	// query modifiers such as 'before', 'after', 'type' and more.
	// in our case it'll be only on the first request
	if ( totalCommentsCount > -1 ) {
		dispatch( {
			type: COMMENTS_COUNT_RECEIVE,
			siteId,
			postId,
			totalCommentsCount
		} );
	}
}

/***
 * Internal handler for comments request failure
 * @param {Function} dispatch redux dispatch function
 * @param {String} requestId request identifier
 * @param {Object} err error object
 */
function commentsRequestFailure( dispatch, requestId, err ) {
	dispatch( {
		type: COMMENTS_REQUEST_FAILURE,
		requestId: requestId,
		error: err
	} );
}

/***
 * Creates a thunk that requests comments for a given post
 * @param {Number} siteId site identifier
 * @param {Number} postId post identifier
 * @returns {Function} thunk that requests comments for a given post
 */
export function requestPostComments( siteId, postId ) {
	return ( dispatch, getState ) => {
		const postCommentRequests = getPostCommentRequests( getState(), siteId, postId );
		const oldestCommentDateForPost = getPostOldestCommentDate( getState(), siteId, postId );

		const query = {
			order: 'DESC',
			number: NUMBER_OF_COMMENTS_PER_FETCH
		};

		if ( oldestCommentDateForPost && oldestCommentDateForPost.toISOString ) {
			query.before = oldestCommentDateForPost.toISOString();
		}

		const requestId = createRequestId( siteId, postId, query );

		// if the request status is in-flight or completed successfully, no need to re-fetch it
		if ( postCommentRequests && [ COMMENTS_REQUEST, COMMENTS_REQUEST_SUCCESS ].indexOf( postCommentRequests.get( requestId ) ) !== -1 ) {
			return;
		}

		dispatch( {
			type: COMMENTS_REQUEST,
			requestId: requestId
		} );

		// promise returned here is mainly for testing purposes
		return wpcom.site( siteId )
					.post( postId )
					.comment()
					.replies( query )
					.then( ( { comments, found } ) => commentsRequestSuccess( { dispatch, requestId, siteId, postId, comments, totalCommentsCount: found } ) )
					.catch( ( err ) => commentsRequestFailure( dispatch, requestId, err ) );
	};
}

/***
 * Creates a placeholder comment for a given text and postId
 * @param {String} commentText text of the comment
 * @param {Number} postId post identifier
 * @param {Number|undefined} parentCommentId parent comment identifier
 * @returns {Object} comment placeholder
 */
function createPlaceholderComment( commentText, postId, parentCommentId ) {
	// We need placehodler id to be unique in the context of siteId, postId for that specific user,
	// date milliseconds will do for that purpose.
	return {
		ID: 'placeholder-' + ( new Date().getTime() ),
		parent: parentCommentId ? { ID: parentCommentId } : false,
		date: ( new Date() ).toISOString(),
		content: commentText,
		status: 'pending',
		type: 'comment',
		post: {
			ID: postId
		},
		isPlaceholder: true,
		placeholderState: PLACEHOLDER_STATE.PENDING
	};
}

/***
 * Creates a remove comment action for a siteId, postId, commentId
 * @param {Number} siteId site identifier
 * @param {Number} postId post identifier
 * @param {Number|String} commentId comment identifier to remove
 * @returns {Object} remove action
 */
export function removeComment( siteId, postId, commentId ) {
	return {
		type: COMMENTS_REMOVE,
		siteId,
		postId,
		commentId
	};
}

/***
 * Creates a thunk that creates a comment for a given post
 * @param {String} commentText text of the comment
 * @param {Number} siteId site identifier
 * @param {Number} postId post identifier
 * @param {Number|undefined} parentCommentId parent comment identifier
 * @returns {Function} a thunk that creates a comment for a given post
 */
export function writeComment( commentText, siteId, postId, parentCommentId ) {
	if ( ! commentText || ! siteId || ! postId ) {
		return;
	}

	return ( dispatch ) => {
		const placeholderComment = createPlaceholderComment( commentText, postId, parentCommentId ),
			skipSort = !! parentCommentId;

		// Insert a placeholder
		dispatch( {
			type: COMMENTS_RECEIVE,
			siteId,
			postId,
			comments: [ placeholderComment ],
			skipSort
		} );

		let apiPromise;

		if ( parentCommentId ) {
			apiPromise = wpcom.site( siteId ).post( postId ).comment( parentCommentId ).reply( {}, commentText );
		} else {
			apiPromise = wpcom.site( siteId ).post( postId ).comment().add( commentText );
		}

		return apiPromise.then( ( comment ) => {
			// remove the placeholder
			dispatch( {
				type: COMMENTS_REMOVE,
				siteId,
				postId,
				commentId: placeholderComment.ID
			} );

			// insert the real comment
			dispatch( {
				type: COMMENTS_RECEIVE,
				siteId,
				postId,
				comments: [ comment ],
				skipSort
			} );

			return comment;
		} )
		.catch( ( error ) => {
			dispatch( {
				type: COMMENTS_ERROR,
				siteId,
				postId,
				commentId: placeholderComment.ID,
				error
			} );

			throw error;
		} );
	};
}

/***
 * Creates a thunk that likes a comment
 * @param {Number} siteId site identifier
 * @param {Number} postId post identifier
 * @param {Number} commentId comment identifier
 * @returns {Function} think that likes a comment
 */
export function likeComment( siteId, postId, commentId ) {
	return ( dispatch ) => {
		// optimistic update
		dispatch( {
			type: COMMENTS_LIKE,
			siteId,
			postId,
			commentId
		} );

		// optimistic revert on error, return here for test more conveniently
		return wpcom.site( siteId ).comment( commentId ).like().add( { source: 'reader' } ).then( ( data ) => dispatch( {
			type: COMMENTS_LIKE_UPDATE,
			siteId,
			postId,
			commentId,
			iLike: data.i_like,
			likeCount: data.like_count
		} ) ).catch( () => dispatch( {
			type: COMMENTS_UNLIKE,
			siteId,
			postId,
			commentId
		} ) );
	};
}

/***
 * Creates a thunk that unlikes a comment
 * @param {Number} siteId site identifier
 * @param {Number} postId post identifier
 * @param {Number} commentId comment identifier
 * @returns {Function} think that unlikes a comment
 */
export function unlikeComment( siteId, postId, commentId ) {
	return ( dispatch ) => {
		// optimistic update
		dispatch( {
			type: COMMENTS_UNLIKE,
			siteId,
			postId,
			commentId
		} );

		// optimistic revert on error, return here for test more conveniently
		return wpcom.site( siteId ).comment( commentId ).like().del( { source: 'reader' } ).then( ( data ) => dispatch( {
			type: COMMENTS_LIKE_UPDATE,
			siteId,
			postId,
			commentId,
			iLike: data.i_like,
			likeCount: data.like_count
		} ) ).catch( () => dispatch( {
			type: COMMENTS_LIKE,
			siteId,
			postId,
			commentId
		} ) );
	};
}
