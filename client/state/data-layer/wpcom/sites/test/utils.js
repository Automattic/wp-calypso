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
} from 'calypso/state/action-types';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { useFakeTimers } from 'calypso/test-helpers/use-sinon';

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
			const result = dispatchNewCommentRequest( action, '/sites/foo/comments' );

			expect( result[ 0 ] ).to.eql( {
				type: COMMENTS_RECEIVE,
				siteId: 2916284,
				postId: 1010,
				skipSort: false,
				comments: [ placeholder ],
			} );
			expect( result[ 1 ] ).to.eql(
				http( {
					apiVersion: '1.1',
					method: 'POST',
					path: '/sites/foo/comments',
					body: { content: 'comment text' },
					onSuccess: { ...action, placeholderId: placeholder.ID },
					onFailure: { ...action, placeholderId: placeholder.ID },
				} )
			);
		} );
	} );

	describe( '#updatePlaceholderComment()', () => {
		test( 'should remove the placeholder comment', () => {
			const action = {
				siteId: 2916284,
				postId: 1010,
				parentCommentId: null,
				placeholderId: 'placeholder-id',
			};
			const comment = { ID: 1, content: 'this is the content' };

			const result = updatePlaceholderComment( action, comment );

			expect( result ).to.have.length( 3 );
			expect( result[ 0 ].type ).to.eql( COMMENTS_DELETE );
			expect( result[ 0 ].siteId ).to.eql( 2916284 );
			expect( result[ 0 ].postId ).to.eql( 1010 );
			expect( result[ 0 ].commentId ).to.eql( 'placeholder-id' );
		} );

		test( 'should dispatch a comments receive action', () => {
			const action = {
				siteId: 2916284,
				postId: 1010,
				parentCommentId: null,
				placeholderId: 'placeholder-id',
			};
			const comment = { ID: 1, content: 'this is the content' };

			const result = updatePlaceholderComment( action, comment );

			expect( result ).to.have.length( 3 );
			expect( result[ 1 ] ).to.eql( {
				type: COMMENTS_RECEIVE,
				siteId: 2916284,
				postId: 1010,
				comments: [ { ID: 1, content: 'this is the content' } ],
				skipSort: false,
				meta: { comment: { context: 'add' } },
			} );
		} );

		test( 'should dispatch a comments count increment action', () => {
			const action = {
				siteId: 2916284,
				postId: 1010,
				parentCommentId: null,
				placeholderId: 'placeholder-id',
			};
			const comment = { ID: 1, content: 'this is the content' };

			const result = updatePlaceholderComment( action, comment );

			expect( result ).to.have.length( 3 );
			expect( result[ 2 ] ).to.eql( {
				type: COMMENTS_COUNT_INCREMENT,
				siteId: 2916284,
				postId: 1010,
			} );
		} );

		test( 'should request a fresh copy of a comments page when the query object is filled', () => {
			const result = updatePlaceholderComment(
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
			expect( result ).to.have.length( 4 );
			expect( result[ result.length - 1 ] ).to.eql( {
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

			handleWriteCommentFailure( { siteId: 2916284, postId: 1010 } )( dispatch, getState );

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
