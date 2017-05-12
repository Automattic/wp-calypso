/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';
import {
	requestingCommentStatusUpdate,
	successCommentStatusUpdateRequest,
	failCommentStatusUpdateRequest,
} from 'state/discussions/actions';
import { requestCommentStatusUpdate } from '../';

describe( 'wpcom-api', () => {
	let dispatch;

	useSandbox( sandbox => ( dispatch = sandbox.spy() ) );

	describe( 'comment status update request', () => {
		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/101010/comments/20', { status: 'approved' } )
				.reply( 200, { status: 'approved' } )
				.post( '/rest/v1.1/sites/101010/comments/20', { status: 'all' } )
				.reply( 403, { error: 'error', message: 'error_message' } );
		} );

		it( 'should not dispatch any action if a request for the specified site and post is in flight' );

		it( 'should dispatch requesting action when the request triggers', () => {
			requestCommentStatusUpdate( { dispatch }, { siteId: 101010, commentId: 20, status: 'approved' } );
			expect( dispatch ).to.have.been.calledWith( requestingCommentStatusUpdate( 101010, 20 ) );
		} );

		it( 'should dispatch a success request action when the request completes', () => {
			return requestCommentStatusUpdate( { dispatch }, { siteId: 101010, commentId: 20, status: 'approved' } )
				.then( () => {
					expect( dispatch ).to.have.been.calledWith( successCommentStatusUpdateRequest( 101010, 20, 'approved' ) );
				} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return requestCommentStatusUpdate( { dispatch }, { siteId: 101010, commentId: 20, content: 'all' } )
				.catch( () => {
					expect( dispatch ).to.have.been.calledWith( failCommentStatusUpdateRequest( 101010, 20, 'all' ) );
				} );
		} );
	} );
} );
