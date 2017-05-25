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
	addComments,
	announceFailure,
} from '../';
import {
	NUMBER_OF_COMMENTS_PER_FETCH
} from 'state/comments/constants';

describe( 'wpcom-api', () => {
	describe( 'post comments request', () => {
		describe( '#fetchPostComments()', () => {
			it( 'should dispatch an HTTP request to the post replies endpoint', () => {
				const query = {
					order: 'DESC',
					number: NUMBER_OF_COMMENTS_PER_FETCH,
					status: 'trash',
					before: '2017-05-25T21:41:25.841Z'
				};
				const action = {
					type: 'DUMMY_ACTION',
					siteId: '101010',
					postId: '1010',
					query
				};
				const dispatch = spy();

				fetchPostComments( { dispatch }, action );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( http( {
					apiVersion: '1.1',
					method: 'GET',
					path: '/sites/101010/posts/1010/replies',
					query
				}, action ) );
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

				announceFailure( { dispatch } );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWithMatch( {
					type: NOTICE_CREATE,
					notice: {
						status: 'is-error'
					}
				} );
			} );
		} );
	} );
} );
