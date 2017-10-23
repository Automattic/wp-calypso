/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { fetchPostComments, addComments, announceFailure, commentsFromApi } from '../';
import { COMMENTS_RECEIVE, COMMENTS_COUNT_RECEIVE, NOTICE_CREATE } from 'state/action-types';
import { NUMBER_OF_COMMENTS_PER_FETCH } from 'state/comments/constants';
import { http } from 'state/data-layer/wpcom-http/actions';

describe( 'wpcom-api', () => {
	describe( 'post comments request', () => {
		describe( '#fetchPostComments()', () => {
			test( 'should dispatch an HTTP request to the post replies endpoint', () => {
				const query = {
					order: 'DESC',
					number: NUMBER_OF_COMMENTS_PER_FETCH,
					status: 'trash',
				};
				const action = {
					type: 'DUMMY_ACTION',
					siteId: '2916284',
					postId: '1010',
					query,
				};
				const dispatch = spy();
				const getState = () => ( {
					comments: {
						items: {
							'2916284-1010': [],
						},
					},
				} );

				fetchPostComments( { dispatch, getState }, action );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith(
					http(
						{
							apiVersion: '1.1',
							method: 'GET',
							path: '/sites/2916284/posts/1010/replies',
							query,
						},
						action
					)
				);
			} );

			test( 'should dispatch an HTTP request to the post replies endpoint, before the oldest contiguous comment in state', () => {
				const query = {
					order: 'DESC',
					number: NUMBER_OF_COMMENTS_PER_FETCH,
					status: 'trash',
				};
				const action = {
					type: 'DUMMY_ACTION',
					siteId: '2916284',
					postId: '1010',
					query,
					direction: 'before',
				};
				const dispatch = spy();
				const getState = () => ( {
					comments: {
						items: {
							'2916284-1010': [
								{ id: 0, date: '2015-05-25T21:41:25.841Z', contiguous: false },
								{ id: 1, date: '2017-05-25T21:41:25.841Z', contiguous: true },
								{ id: 2, date: '2017-05-25T20:41:25.841Z', contiguous: true },
								{ id: 3, date: '2017-05-25T19:41:25.841Z', contiguous: true },
							],
						},
					},
				} );

				fetchPostComments( { dispatch, getState }, action );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith(
					http(
						{
							apiVersion: '1.1',
							method: 'GET',
							path: '/sites/2916284/posts/1010/replies',
							query: {
								...query,
								before: '2017-05-25T19:41:25.841Z',
							},
						},
						action
					)
				);
			} );
		} );

		describe( '#addComments', () => {
			test( 'should dispatch a comments receive action', () => {
				const dispatch = spy();
				const action = {
					siteId: 2916284,
					postId: 1010,
					direction: 'before',
				};
				const data = {
					comments: [],
					found: -1,
				};

				addComments( { dispatch }, action, data );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( {
					type: COMMENTS_RECEIVE,
					siteId: 2916284,
					postId: 1010,
					comments: [],
					direction: 'before',
				} );
			} );

			test( 'should dispatch a comments receive action and a count receive action when comments found', () => {
				const dispatch = spy();
				const action = {
					siteId: 2916284,
					postId: 1010,
					direction: 'before',
				};
				const data = {
					comments: [ {}, {} ],
					found: 2,
				};

				addComments( { dispatch }, action, data );

				expect( dispatch ).to.have.been.calledTwice;
				expect( dispatch ).to.have.been.calledWith( {
					type: COMMENTS_RECEIVE,
					siteId: 2916284,
					postId: 1010,
					comments: [ {}, {} ],
					direction: 'before',
				} );

				expect( dispatch ).to.have.been.calledWith( {
					type: COMMENTS_COUNT_RECEIVE,
					siteId: 2916284,
					postId: 1010,
					totalCommentsCount: 2,
				} );
			} );
		} );

		describe( 'commentsFromApi', () => {
			test( 'should decode author name entities', () => {
				const comments = [ { author: { name: 'joe' } }, { author: { name: '&#9829;' } } ];
				expect( commentsFromApi( comments ) ).eql( [
					{ author: { name: 'joe' } },
					{ author: { name: '♥' } },
				] );
			} );
		} );

		describe( '#announceFailure', () => {
			test( 'should dispatch an error notice', () => {
				const dispatch = spy();
				const getState = () => ( {
					posts: {
						queries: {},
					},
				} );

				announceFailure( { dispatch, getState }, { siteId: 2916284, postId: 1010 } );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWithMatch( {
					type: NOTICE_CREATE,
					notice: {
						status: 'is-error',
						text: 'Could not retrieve comments for requested post',
					},
				} );
			} );
		} );
	} );
} );
