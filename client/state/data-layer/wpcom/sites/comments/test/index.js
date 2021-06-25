/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import {
	addComments,
	announceEditFailure,
	editComment,
	fetchCommentsList,
	handleChangeCommentStatusSuccess,
	requestComment,
	receiveCommentError,
	receiveCommentSuccess,
} from '../';
import { COMMENTS_EDIT, NOTICE_REMOVE, COMMENTS_RECEIVE } from 'calypso/state/action-types';
import {
	requestComment as requestCommentAction,
	editComment as editCommentAction,
	receiveComments as receiveCommentsAction,
	receiveCommentsError as receiveCommentsErrorAction,
} from 'calypso/state/comments/actions';
import { bypassDataLayer } from 'calypso/state/data-layer/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';
import { noRetry } from 'calypso/state/data-layer/wpcom-http/pipeline/retry-on-failure/policies';

const query = {
	siteId: 1337,
	status: 'unapproved',
	type: 'comment',
};

describe( '#addComments', () => {
	test( 'should dispatch a tree initialization action for no comments', () => {
		expect( addComments( { query }, { comments: [] } )[ 1 ] ).toEqual( {
			type: 'COMMENTS_TREE_SITE_ADD',
			siteId: query.siteId,
			status: query.status,
			tree: [],
		} );
	} );

	test( 'should dispatch to add received comments into state', () => {
		const comments = [
			{ ID: 5, post: { ID: 1 } },
			{ ID: 6, post: { ID: 1 } },
		];

		const result = addComments( { query }, { comments } );

		expect( result[ 1 ] ).toEqual(
			receiveCommentsAction( {
				siteId: query.siteId,
				postId: 1,
				comments,
			} )
		);
	} );

	test( 'should dispatch received comments into separate actions per post', () => {
		const comments = [
			{ ID: 5, post: { ID: 1 } },
			{ ID: 6, post: { ID: 2 } },
			{ ID: 2, post: { ID: 1 } },
		];

		const result = addComments( { query }, { comments } );

		expect( result[ 1 ] ).toEqual( {
			siteId: query.siteId,
			commentById: false,
			type: COMMENTS_RECEIVE,
			postId: 1,
			comments: [ comments[ 0 ], comments[ 2 ] ],
		} );

		expect( result[ 2 ] ).toEqual( {
			siteId: query.siteId,
			commentById: false,
			type: COMMENTS_RECEIVE,
			postId: 2,
			comments: [ comments[ 1 ] ],
		} );
	} );
} );

describe( '#fetchCommentList', () => {
	test( 'should do nothing if no listType provided', () => {
		expect( fetchCommentsList( { query } ) ).toBeUndefined();
	} );

	test( 'should do nothing if invalid listType provided', () => {
		expect( fetchCommentsList( { query: { ...query, listType: 'Calypso' } } ) ).toBeUndefined();
	} );

	test( 'should dispatch HTTP request for site comments', () => {
		expect( fetchCommentsList( { query: { ...query, listType: 'site' } } ) ).toMatchObject( {
			type: 'WPCOM_HTTP_REQUEST',
			path: '/sites/1337/comments',
		} );
	} );

	test( 'should default to fetch pending comments', () => {
		expect( fetchCommentsList( { query: { listType: 'site', siteId: 1337 } } ) ).toMatchObject( {
			query: { status: 'unapproved' },
		} );
	} );

	test( 'should default to fetch comment-type comments', () => {
		expect( fetchCommentsList( { query: { listType: 'site', siteId: 1337 } } ) ).toMatchObject( {
			query: { type: 'comment' },
		} );
	} );
} );

describe( '#requestComment', () => {
	test( 'should dispatch http action', () => {
		const siteId = '124';
		const commentId = '579';
		const action = requestCommentAction( { siteId, commentId } );

		expect( requestComment( action ) ).toEqual(
			http(
				{
					method: 'GET',
					path: `/sites/${ siteId }/comments/${ commentId }`,
					apiVersion: '1.1',
				},
				action
			)
		);
	} );

	test( 'when we see an attempt to use the wpcom endpoint over a jetpack remote, we do not attempt to retry using that query', () => {
		const siteId = '124';
		const commentId = '579';
		const action = requestCommentAction( { siteId, commentId, query: { force: 'wpcom' } } );

		expect( requestComment( action ) ).toEqual(
			http(
				{
					method: 'GET',
					path: `/sites/${ siteId }/comments/${ commentId }`,
					apiVersion: '1.1',
					query: { force: 'wpcom' },
					retryPolicy: noRetry(),
				},
				action
			)
		);
	} );
} );

describe( '#receiveCommentSuccess', () => {
	test( 'should dispatch receive comments with a single comment', () => {
		const siteId = '124';
		const commentId = '579';
		const response = { post: { ID: 1 } };
		const requestAction = requestCommentAction( { siteId, commentId } );

		const dispatchedAction = receiveCommentSuccess( requestAction, response );
		expect( dispatchedAction ).toEqual(
			receiveCommentsAction( {
				siteId,
				postId: response.post.ID,
				comments: [ response ],
				commentById: true,
			} )
		);
	} );
} );

describe( '#receiveCommentError', () => {
	test( 'should dispatch receive error with a single comment', () => {
		const siteId = '124';
		const commentId = '579';
		const response = { post: { ID: 1 } };
		const action = requestCommentAction( { siteId, commentId } );

		expect( receiveCommentError( action, response ) ).toEqual(
			receiveCommentsErrorAction( {
				siteId,
				commentId,
			} )
		);
	} );

	test( 'when we see a failed shadow comment get, we should dispatch retry to the remote', () => {
		const siteId = '124';
		const commentId = '579';
		const response = { post: { ID: 1 } };
		const action = requestCommentAction( { siteId, commentId, query: { force: 'wpcom' } } );

		expect( receiveCommentError( action, response ) ).toEqual(
			requestCommentAction( {
				siteId,
				commentId,
			} )
		);
	} );
} );

describe( '#editComment', () => {
	test( 'should dispatch a http action', () => {
		const dispatch = jest.fn();
		const originalComment = { ID: 123, text: 'lorem ipsum' };
		const newComment = { ID: 123, text: 'lorem ipsum dolor' };
		const action = editCommentAction( 1, 1, 123, newComment );
		const getState = () => ( {
			comments: {
				items: {
					'1-1': [ originalComment ],
				},
			},
		} );

		editComment( action )( dispatch, getState );

		expect( dispatch ).toHaveBeenCalledWith(
			http(
				{
					method: 'POST',
					path: '/sites/1/comments/123',
					apiVersion: '1.1',
					body: newComment,
				},
				{
					...action,
					originalComment,
				}
			)
		);
	} );
} );

describe( '#announceEditFailure', () => {
	const originalComment = { ID: 123, text: 'lorem ipsum' };
	const newComment = { ID: 123, text: 'lorem ipsum dolor' };
	const action = editCommentAction( 1, 1, 123, newComment );

	test( 'should dispatch a local comment edit action', () => {
		expect( announceEditFailure( { ...action, originalComment } ) ).toContainEqual(
			bypassDataLayer( {
				type: COMMENTS_EDIT,
				siteId: 1,
				postId: 1,
				commentId: 123,
				comment: originalComment,
			} )
		);
	} );

	test( 'should dispatch a remove notice action', () => {
		expect( announceEditFailure( { ...action, originalComment } ) ).toContainEqual(
			removeNotice( 'comment-notice-123' )
		);
	} );

	test( 'should dispatch an error notice', () => {
		expect( announceEditFailure( { ...action, originalComment } ) ).toContainEqual(
			errorNotice( "We couldn't update this comment.", {
				id: `comment-notice-error-${ action.commentId }`,
			} )
		);
	} );
} );

describe( '#handleChangeCommentStatusSuccess', () => {
	test( 'should remove the error notice', () => {
		const output = handleChangeCommentStatusSuccess( { commentId: 1234 } );
		expect( output ).toEqual( [
			{
				type: NOTICE_REMOVE,
				noticeId: 'comment-notice-error-1234',
			},
		] );
	} );

	test( 'should request a fresh copy of a comments page when the query object is filled', () => {
		const output = handleChangeCommentStatusSuccess( {
			commentId: 1234,
			refreshCommentListQuery: {
				listType: 'site',
				number: 20,
				page: 1,
				siteId: 12345678,
				status: 'all',
				type: 'any',
			},
		} );
		expect( output ).toEqual( [
			{
				type: NOTICE_REMOVE,
				noticeId: 'comment-notice-error-1234',
			},
			{
				type: 'COMMENTS_LIST_REQUEST',
				query: {
					listType: 'site',
					number: 20,
					page: 1,
					siteId: 12345678,
					status: 'all',
					type: 'any',
				},
			},
		] );
	} );
} );
