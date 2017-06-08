/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	COMMENTS_REMOVE,
	COMMENTS_RECEIVE,
	COMMENTS_COUNT_INCREMENT,
	NOTICE_CREATE
} from 'state/action-types';
import {
	writePostComment,
	handleSuccess,
	handleFailure,
} from '../';
import { useFakeTimers } from 'test/helpers/use-sinon';

describe( 'wpcom-api', () => {
	describe( 'new site replies', () => {
		describe( '#writePostComment()', () => {
			const action = {
				type: 'DUMMY',
				siteId: 2916284,
				postId: 1010,
				commentText: 'comment text'
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
				type: 'comment'
			};

			useFakeTimers();

			it( 'should dispatch a http request action to the new post replies endpoint', () => {
				const dispatch = spy();

				writePostComment( { dispatch }, action );

				expect( dispatch ).to.have.been.calledTwice;
				expect( dispatch ).to.have.been.calledWith( {
					type: COMMENTS_RECEIVE,
					siteId: 2916284,
					postId: 1010,
					skipSort: false,
					comments: [ placeholder ],
				} );
				expect( dispatch ).to.have.been.calledWith( http( {
					apiVersion: '1.1',
					method: 'POST',
					path: '/sites/2916284/posts/1010/replies/new',
					body: { content: 'comment text' },
					onSuccess: { ...action, placeholderId: placeholder.ID },
					onFailure: action
				} ) );
			} );

			it( 'should dispatch a http request action to the new comment replied endpoint', () => {
				const dispatch = spy();

				writePostComment( { dispatch }, { ...action, parentCommentId: 10, } );

				expect( dispatch ).to.have.been.calledTwice;
				expect( dispatch ).to.have.been.calledWith( {
					type: COMMENTS_RECEIVE,
					siteId: 2916284,
					postId: 1010,
					skipSort: true,
					comments: [ { ...placeholder, parent: { ID: 10 } } ],
				} );
				expect( dispatch ).to.have.been.calledWith( http( {
					apiVersion: '1.1',
					method: 'POST',
					path: '/sites/2916284/comments/10/replies/new',
					body: { content: 'comment text' },
					onSuccess: { ...action, parentCommentId: 10, placeholderId: placeholder.ID },
					onFailure: { ...action, parentCommentId: 10, }
				} ) );
			} );
		} );

		describe( '#handleSuccess', () => {
			it( 'should remove the placeholder comment', () => {
				const dispatch = spy();
				const action = {
					siteId: 2916284,
					postId: 1010,
					parentCommentId: null,
					placeholderId: 'placeholder-id'
				};
				const comment = { ID: 1, content: 'this is the content' };

				handleSuccess( { dispatch }, action, null, comment );

				expect( dispatch ).to.have.been.calledThrice;
				expect( dispatch ).to.have.been.calledWith( {
					type: COMMENTS_REMOVE,
					siteId: 2916284,
					postId: 1010,
					commentId: 'placeholder-id'
				} );
			} );

			it( 'should dispatch a comments receive action', () => {
				const dispatch = spy();
				const action = {
					siteId: 2916284,
					postId: 1010,
					parentCommentId: null,
					placeholderId: 'placeholder-id'
				};
				const comment = { ID: 1, content: 'this is the content' };

				handleSuccess( { dispatch }, action, null, comment );

				expect( dispatch ).to.have.been.calledThrice;
				expect( dispatch ).to.have.been.calledWith( {
					type: COMMENTS_RECEIVE,
					siteId: 2916284,
					postId: 1010,
					comments: [ { ID: 1, content: 'this is the content' } ],
					skipSort: false
				} );
			} );

			it( 'should dispatch a comments count increment action', () => {
				const dispatch = spy();
				const action = {
					siteId: 2916284,
					postId: 1010,
					parentCommentId: null,
					placeholderId: 'placeholder-id'
				};
				const comment = { ID: 1, content: 'this is the content' };

				handleSuccess( { dispatch }, action, null, comment );

				expect( dispatch ).to.have.been.calledThrice;
				expect( dispatch ).to.have.been.calledWith( {
					type: COMMENTS_COUNT_INCREMENT,
					siteId: 2916284,
					postId: 1010
				} );
			} );
		} );

		describe( '#handleFailure', () => {
			it( 'should dispatch an error notice', () => {
				const dispatch = spy();
				const getState = () => ( {
					posts: {
						queries: {}
					}
				} );

				handleFailure( { dispatch, getState }, { siteId: 2916284, postId: 1010 } );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWithMatch( {
					type: NOTICE_CREATE,
					notice: {
						status: 'is-error',
						text: 'Could not add a reply to this post'
					}
				} );
			} );
		} );
	} );
} );
