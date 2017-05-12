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
	successCommentStatusUpdateRequest,
	failCommentStatusUpdateRequest,
} from 'state/discussions/actions';
import {
	requestCommentStatusUpdate,
	receiveStatusUpdate,
	receiveError
} from '../';

describe( 'wpcom-api', () => {
	describe( 'content update', () => {
		describe( '#requestCommentStatusUpdate()', () => {
			it( 'should not dispatch any action if a request for the specified site and post is in flight' );

			it( 'should dispatch HTTP request to comments endpoint', () => {
				const action = {
					type: 'DUMMY',
					siteId: 101010,
					commentId: 20,
					status: 'approved'
				};
				const dispatch = spy();
				const next = spy();

				requestCommentStatusUpdate( { dispatch }, action, next );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( http( {
					apiVersion: '1.1',
					method: 'POST',
					path: '/sites/101010/comments/20',
					body: { status: action.status }
				} ) );
			} );

			it( 'should pass the original action along the middleware chain', () => {
				const action = { type: 'DUMMY' };
				const dispatch = spy();
				const next = spy();

				requestCommentStatusUpdate( { dispatch }, action, next );

				expect( next ).to.have.been.calledOnce;
				expect( next ).to.have.been.calledWith( action );
			} );
		} );

		describe( '#receiveContentUpdate()', () => {
			it( 'should dispatch a success request action', () => {
				const response = { status: 'approved' };
				const action = successCommentStatusUpdateRequest( 101010, 20, 'approved' );
				const dispatch = spy();
				const next = spy();

				receiveStatusUpdate( { dispatch }, action, next, response );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( successCommentStatusUpdateRequest( 101010, 20, 'approved' ) );
			} );
		} );

		describe( '#receiveError', () => {
			it( 'should dispatch error', () => {
				const error = 'could not update content for comment';
				const action = failCommentStatusUpdateRequest( 101010, 20, 'approved', error );
				const dispatch = spy();
				const next = spy();

				receiveError( { dispatch }, action, next, error );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( failCommentStatusUpdateRequest( 101010, 20, 'approved', error ) );
			} );
		} );
	} );
} );
