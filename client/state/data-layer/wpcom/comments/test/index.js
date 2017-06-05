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
	COMMENTS_RECEIVE,
	COMMENTS_COUNT_RECEIVE,
	NOTICE_CREATE
} from 'state/action-types';
import {
	fetchPostComments,
	writePostComment,
	addComments,
	announceFailure,
} from '../';
import {
	NUMBER_OF_COMMENTS_PER_FETCH
} from 'state/comments/constants';
import { useFakeTimers } from 'test/helpers/use-sinon';

describe( 'wpcom-api', () => {
	describe( 'post comments request', () => {
		describe( '#fetchPostComments()', () => {
			it( 'should dispatch an HTTP request to the post replies endpoint', () => {
				const query = {
					order: 'DESC',
					number: NUMBER_OF_COMMENTS_PER_FETCH,
					status: 'trash'
				};
				const action = {
					type: 'DUMMY_ACTION',
					siteId: '101010',
					postId: '1010',
					query
				};
				const dispatch = spy();
				const getState = () => ( {
					comments: {
						items: {
							'101010-1010': []
						}
					}
				} );

				fetchPostComments( { dispatch, getState }, action );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( http( {
					apiVersion: '1.1',
					method: 'GET',
					path: '/sites/101010/posts/1010/replies',
					query
				}, action ) );
			} );

			it( 'should dispatch an HTTP request to the post replies endpoint, before the oldest comment in state', () => {
				const query = {
					order: 'DESC',
					number: NUMBER_OF_COMMENTS_PER_FETCH,
					status: 'trash',
				};
				const action = {
					type: 'DUMMY_ACTION',
					siteId: '101010',
					postId: '1010',
					query
				};
				const dispatch = spy();
				const getState = () => ( {
					comments: {
						items: {
							'101010-1010': [
								{ id: 1, date: '2017-05-25T21:41:25.841Z' },
								{ id: 2, date: '2017-05-25T20:41:25.841Z' },
								{ id: 3, date: '2017-05-25T19:41:25.841Z' }
							]
						}
					}
				} );

				fetchPostComments( { dispatch, getState }, action );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( http( {
					apiVersion: '1.1',
					method: 'GET',
					path: '/sites/101010/posts/1010/replies',
					query: {
						...query,
						before: '2017-05-25T19:41:25.841Z'
					}
				}, action ) );
			} );
		} );

		describe( '#writePostComment()', () => {
			const action = {
				type: 'DUMMY',
				siteId: 101010,
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
					siteId: 101010,
					postId: 1010,
					skipSort: false,
					comments: [ placeholder ],
				} );
				expect( dispatch ).to.have.been.calledWith( http( {
					apiVersion: '1.1',
					method: 'POST',
					path: '/sites/101010/posts/1010/replies/new',
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
					siteId: 101010,
					postId: 1010,
					skipSort: true,
					comments: [ { ...placeholder, parent: { ID: 10 } } ],
				} );
				expect( dispatch ).to.have.been.calledWith( http( {
					apiVersion: '1.1',
					method: 'POST',
					path: '/sites/101010/comments/10/replies/new',
					body: { content: 'comment text' },
					onSuccess: { ...action, parentCommentId: 10, placeholderId: placeholder.ID },
					onFailure: { ...action, parentCommentId: 10, }
				} ) );
			} );
		} );

		describe( '#addComments', () => {
			it( 'should dispatch a comments receive action', () => {
				const dispatch = spy();
				const action = {
					siteId: 101010,
					postId: 1010
				};
				const data = {
					comments: [],
					found: -1
				};

				addComments( { dispatch }, action, null, data );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( {
					type: COMMENTS_RECEIVE,
					siteId: 101010,
					postId: 1010,
					comments: []
				} );
			} );

			it( 'should dispatch a comments receive action and a count receive action when comments found', () => {
				const dispatch = spy();
				const action = {
					siteId: 101010,
					postId: 1010
				};
				const data = {
					comments: [ {}, {} ],
					found: 2
				};

				addComments( { dispatch }, action, null, data );

				expect( dispatch ).to.have.been.calledTwice;
				expect( dispatch ).to.have.been.calledWith( {
					type: COMMENTS_RECEIVE,
					siteId: 101010,
					postId: 1010,
					comments: [ {}, {} ]
				} );

				expect( dispatch ).to.have.been.calledWith( {
					type: COMMENTS_COUNT_RECEIVE,
					siteId: 101010,
					postId: 1010,
					totalCommentsCount: 2
				} );
			} );
		} );

		describe( '#announceFailure', () => {
			it( 'should dispatch an error notice', () => {
				const dispatch = spy();
				const getState = () => ( {
					posts: {
						queries: {}
					}
				} );

				announceFailure( { dispatch, getState }, { siteId: 101010, postId: 1010 } );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWithMatch( {
					type: NOTICE_CREATE,
					notice: {
						status: 'is-error',
						text: 'Could not retrieve comments for requested post'
					}
				} );
			} );
		} );
	} );
} );
