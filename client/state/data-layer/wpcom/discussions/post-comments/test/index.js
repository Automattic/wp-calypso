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
	// receivePostComments,
	successPostCommentsRequest,
	receivePostCommentsCount,
	failPostCommentsRequest
} from 'state/discussions/actions';
import {
	requestPostComments,
	receivePostComments,
	receiveError,
} from '../';

describe( 'wpcom-api', () => {
	describe( 'post comments request', () => {
		describe( '#requestPostComments()', () => {
			it( 'should not dispatch any action if a request for the specified site and post is in flight' );

			it( 'should dispatch HTTP request to comments endpoint', () => {
				const action = {
					type: 'DUMMY',
					siteId: 101010,
					postId: 10,
					status: 'all'
				};
				const dispatch = spy();
				const next = spy();

				requestPostComments( { dispatch }, action, next );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( http( {
					apiVersion: '1.1',
					method: 'GET',
					path: '/sites/101010/posts/10/replies',
					query: { status: action.status }
				} ) );
			} );

			it( 'should pass the original action along the middleware chain', () => {
				const action = { type: 'DUMMY' };
				const dispatch = spy();
				const next = spy();

				requestPostComments( { dispatch }, action, next );

				expect( next ).to.have.been.calledOnce;
				expect( next ).to.have.been.calledWith( action );
			} );
		} );

		describe( '#receiveLikeUpdate()', () => {
			it( 'should dispatch a success request action', () => {
				const response = { comments: [], found: 5 };
				const action = {
					type: 'DUMMY',
					siteId: 101010,
					postId: 10,
					status: 'all',
					comments: []
				};
				const dispatch = spy();
				const next = spy();

				receivePostComments( { dispatch }, action, next, response );

				expect( dispatch ).to.have.been.calledTwice;
				expect( dispatch ).to.have.been.calledWith( successPostCommentsRequest( 101010, 10, 'all', [] ) );
				expect( dispatch ).to.have.been.calledWith( receivePostCommentsCount( 101010, 10, 5 ) );
			} );
		} );

		describe( '#receiveError', () => {
			it( 'should dispatch error', () => {
				const error = 'could not retrieve comments';
				const action = failPostCommentsRequest( 101010, 10, 'all', error );
				const dispatch = spy();
				const next = spy();

				receiveError( { dispatch }, action, next, error );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( failPostCommentsRequest( 101010, 10, 'all', error ) );
			} );
		} );
	} );
} );
