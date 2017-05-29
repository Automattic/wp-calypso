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
	sucessCommentLikeRequest,
	failCommentLikeRequest,
} from 'state/discussions/actions';
import {
	requestCommentLike,
	requestCommentUnLike,
	receiveLikeUpdate,
	receiveError
} from '../';

describe( 'wpcom-api', () => {
	describe( 'comment like/unlike', () => {
		describe( '#requestCommentLike()', () => {
			it( 'should not dispatch any action if a request for the specified site and post is in flight' );

			it( 'should dispatch HTTP request to comments endpoint', () => {
				const action = {
					type: 'DUMMY',
					siteId: 101010,
					commentId: 20,
					source: 'reader'
				};
				const dispatch = spy();
				const next = spy();

				requestCommentLike( { dispatch }, action, next );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( http( {
					apiVersion: '1.1',
					method: 'POST',
					path: '/sites/101010/comments/20/likes/new',
					body: { source: action.source }
				} ) );
			} );

			it( 'should pass the original action along the middleware chain', () => {
				const action = { type: 'DUMMY' };
				const dispatch = spy();
				const next = spy();

				requestCommentLike( { dispatch }, action, next );

				expect( next ).to.have.been.calledOnce;
				expect( next ).to.have.been.calledWith( action );
			} );
		} );

		describe( '#requestCommentUnLike()', () => {
			it( 'should not dispatch any action if a request for the specified site and post is in flight' );

			it( 'should dispatch HTTP request to comments endpoint', () => {
				const action = {
					type: 'DUMMY',
					siteId: 101010,
					commentId: 20,
					source: 'reader'
				};
				const dispatch = spy();
				const next = spy();

				requestCommentUnLike( { dispatch }, action, next );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( http( {
					apiVersion: '1.1',
					method: 'POST',
					path: '/sites/101010/comments/20/likes/mine/delete',
					body: { source: action.source }
				} ) );
			} );

			it( 'should pass the original action along the middleware chain', () => {
				const action = { type: 'DUMMY' };
				const dispatch = spy();
				const next = spy();

				requestCommentUnLike( { dispatch }, action, next );

				expect( next ).to.have.been.calledOnce;
				expect( next ).to.have.been.calledWith( action );
			} );
		} );

		describe( '#receiveLikeUpdate()', () => {
			it( 'should dispatch a success request action', () => {
				const response = { i_like: true, like_count: 5 };
				const action = sucessCommentLikeRequest( 101010, 20, 'reader', true, 5 );
				const dispatch = spy();
				const next = spy();

				receiveLikeUpdate( { dispatch }, action, next, response );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( sucessCommentLikeRequest( 101010, 20, 'reader', true, 5 ) );
			} );
		} );

		describe( '#receiveError', () => {
			it( 'should dispatch error', () => {
				const error = 'could not like comment';
				const action = failCommentLikeRequest( 101010, 20, 'reader', error );
				const dispatch = spy();
				const next = spy();

				receiveError( { dispatch }, action, next, error );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( failCommentLikeRequest( 101010, 20, 'reader', error ) );
			} );
		} );
	} );
} );
