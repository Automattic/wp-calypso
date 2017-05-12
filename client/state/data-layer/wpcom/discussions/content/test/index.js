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
	successCommentContentUpdateRequest,
	failCommentContentUpdateRequest,
} from 'state/discussions/actions';
import {
	requestCommentContentUpdate,
	receiveContentUpdate,
	receiveError
} from '../';

describe( 'wpcom-api', () => {
	describe( 'comment content update', () => {
		describe( '#requestCommentContentUpdate()', () => {
			it( 'should not dispatch any action if a request for the specified site and post is in flight' );

			it( 'should dispatch HTTP request to comments endpoint', () => {
				const action = {
					type: 'DUMMY',
					siteId: 101010,
					commentId: 20,
					content: 'lorem ipsum'
				};
				const dispatch = spy();
				const next = spy();

				requestCommentContentUpdate( { dispatch }, action, next );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( http( {
					apiVersion: '1.1',
					method: 'POST',
					path: '/sites/101010/comments/20',
					body: { content: action.content }
				} ) );
			} );

			it( 'should pass the original action along the middleware chain', () => {
				const action = { type: 'DUMMY' };
				const dispatch = spy();
				const next = spy();

				requestCommentContentUpdate( { dispatch }, action, next );

				expect( next ).to.have.been.calledOnce;
				expect( next ).to.have.been.calledWith( action );
			} );
		} );

		describe( '#receiveContentUpdate()', () => {
			it( 'should dispatch a success request action', () => {
				const response = { content: 'lorem ipsum' };
				const action = successCommentContentUpdateRequest( 101010, 20, 'lorem ipsum' );
				const dispatch = spy();
				const next = spy();

				receiveContentUpdate( { dispatch }, action, next, response );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( successCommentContentUpdateRequest( 101010, 20, 'lorem ipsum' ) );
			} );
		} );

		describe( '#receiveError', () => {
			it( 'should dispatch error', () => {
				const error = 'could not update content for comment';
				const action = failCommentContentUpdateRequest( 101010, 20, 'lorem ipsum', error );
				const dispatch = spy();
				const next = spy();

				receiveError( { dispatch }, action, next, error );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( failCommentContentUpdateRequest( 101010, 20, 'lorem ipsum', error ) );
			} );
		} );
	} );
} );
