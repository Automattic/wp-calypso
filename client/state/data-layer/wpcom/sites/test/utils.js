/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import {
	createPlaceholderComment,
	dispatchNewCommentRequest,
	updatePlaceholderComment,
	handleWriteCommentFailure,
} from '../utils';
import {
	COMMENTS_DELETE,
	COMMENTS_RECEIVE,
	COMMENTS_COUNT_INCREMENT,
	NOTICE_CREATE,
} from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { useFakeTimers } from 'test/helpers/use-sinon';

describe( 'utility functions', () => {
	useFakeTimers();

	describe( '#createPlaceholderComment()', () => {
		test( 'should return a comment placeholder', () => {
			const placeholder = createPlaceholderComment( 'comment text', 1, 2 );

			expect( placeholder ).to.eql( {
				ID: 'placeholder-0',
				content: 'comment text',
				date: '1970-01-01T00:00:00.000Z',
				isPlaceholder: true,
				parent: { ID: 2 },
				placeholderState: 'PENDING',
				post: { ID: 1 },
				status: 'pending',
				type: 'comment',
			} );
		} );
	} );

	describe( '#dispatchNewCommentRequest()', () => {
		const action = {
			type: 'DUMMY',
			siteId: 2916284,
			postId: 1010,
			commentText: 'comment text',
		};
		const placeholder = {
			ID: 'placeholder-0',
			content: 'comment text',
			date: '1970-01-01T00:00:00.000Z',
			isPlaceholder: true,
			parent: false,
			placeholderState: 'PENDING',
			post: { ID: 1010 },
			status: 'pending',
			type: 'comment',
		};

		test( 'should dispatch a http request action to the specified path', () => {
			const dispatch = spy();

			dispatchNewCommentRequest( dispatch, action, '/sites/foo/comments' );

			expect( dispatch ).to.have.been.calledTwice;
			expect( dispatch ).to.have.been.calledWith( {
				type: COMMENTS_RECEIVE,
				siteId: 2916284,
				postId: 1010,
				skipSort: false,
				comments: [ placeholder ],
			} );
			expect( dispatch ).to.have.been.calledWithMatch(
				http( {
					apiVersion: '1.1',
					method: 'POST',
					path: '/sites/foo/comments',
					body: { content: 'comment text' },
					onSuccess: { ...action, placeholderId: placeholder.ID },
					onFailure: action,
				} )
			);
		} );
	} );

	describe( '#updatePlaceholderComment()', () => {
		test( 'should remove the placeholder comment', () => {
			const dispatch = spy();
			const action = {
				siteId: 2916284,
				postId: 1010,
				parentCommentId: null,
				placeholderId: 'placeholder-id',
			};
			const comment = { ID: 1, content: 'this is the content' };

			updatePlaceholderComment( { dispatch }, action, comment );

			expect( dispatch ).to.have.been.calledThrice;
			expect( dispatch ).to.have.been.calledWithMatch( {
				type: COMMENTS_DELETE,
				siteId: 2916284,
				postId: 1010,
				commentId: 'placeholder-id',
			} );
		} );

		test( 'should dispatch a comments receive action', () => {
			const dispatch = spy();
			const action = {
				siteId: 2916284,
				postId: 1010,
				parentCommentId: null,
				placeholderId: 'placeholder-id',
			};
			const comment = { ID: 1, content: 'this is the content' };

			updatePlaceholderComment( { dispatch }, action, comment );

			expect( dispatch ).to.have.been.calledThrice;
			expect( dispatch ).to.have.been.calledWith( {
				type: COMMENTS_RECEIVE,
				siteId: 2916284,
				postId: 1010,
				comments: [ { ID: 1, content: 'this is the content' } ],
				skipSort: false,
				meta: { comment: { context: 'add' } },
			} );
		} );

		test( 'should dispatch a comments count increment action', () => {
			const dispatch = spy();
			const action = {
				siteId: 2916284,
				postId: 1010,
				parentCommentId: null,
				placeholderId: 'placeholder-id',
			};
			const comment = { ID: 1, content: 'this is the content' };

			updatePlaceholderComment( { dispatch }, action, comment );

			expect( dispatch ).to.have.been.calledThrice;
			expect( dispatch ).to.have.been.calledWith( {
				type: COMMENTS_COUNT_INCREMENT,
				siteId: 2916284,
				postId: 1010,
			} );
		} );

		test( 'should request a fresh copy of a comments page when the query object is filled', () => {
			const dispatch = spy();
			updatePlaceholderComment(
				{ dispatch },
				{
					siteId: 12345678,
					postId: 1234,
					parentCommentId: null,
					placeholderId: 'placeholder-id',
					refreshCommentListQuery: {
						listType: 'site',
						number: 20,
						page: 1,
						siteId: 12345678,
						status: 'all',
						type: 'any',
					},
				},
				{ ID: 1, content: 'this is the content' }
			);
			expect( dispatch ).to.have.callCount( 4 );
			expect( dispatch.lastCall ).to.have.been.calledWithExactly( {
				type: 'COMMENTS_LIST_REQUEST',
				query: {
					listType: 'site',
					number: 20,
					page: 1,
					siteId: 12345678,
					status: 'all',
					type: 'any',
				},
			} );
		} );
	} );

	describe( '#handleWriteCommentFailure()', () => {
		test( 'should dispatch an error notice', () => {
			const dispatch = spy();
			const getState = () => ( {
				posts: {
					queries: {},
				},
			} );

			handleWriteCommentFailure( { dispatch, getState }, { siteId: 2916284, postId: 1010 } );

			expect( dispatch ).to.have.been.calledWithMatch( {
				type: NOTICE_CREATE,
				notice: {
					status: 'is-error',
					text: 'Could not add a reply to this post',
				},
			} );
		} );
	} );
} );
