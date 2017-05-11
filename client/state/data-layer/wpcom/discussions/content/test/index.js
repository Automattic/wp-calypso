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
	requestingCommentContentUpdate,
	successCommentContentUpdateRequest,
	failCommentContentUpdateRequest,
} from 'state/discussions/actions';
import { requestCommentContentUpdate } from '../';

describe( 'wpcom-api', () => {
	let dispatch;

	useSandbox( sandbox => ( dispatch = sandbox.spy() ) );

	describe( 'comment content update request', () => {
		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/101010/comments/20', { content: 'lorem ipsum' } )
				.reply( 200, { content: 'lorem ipsum' } )
				.post( '/rest/v1.1/sites/101010/comments/20', { content: '' } )
				.reply( 403, { error: 'error', message: 'error_message' } );
		} );

		it( 'should not dispatch any action if a request for the specified site and post is in flight' );

		it( 'should dispatch requesting action when the request triggers', () => {
			requestCommentContentUpdate( { dispatch }, { siteId: 101010, commentId: 20, content: 'lorem ipsum' } );
			expect( dispatch ).to.have.been.calledWith( requestingCommentContentUpdate( 101010, 20 ) );
		} );

		it( 'should dispatch a success request action when the request completes', () => {
			return requestCommentContentUpdate( { dispatch }, { siteId: 101010, commentId: 20, content: 'lorem ipsum' } )
				.then( () => {
					expect( dispatch ).to.have.been.calledWith( successCommentContentUpdateRequest( 101010, 20, 'lorem ipsum' ) );
				} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return requestCommentContentUpdate( { dispatch }, { siteId: 101010, commentId: 20, content: '' } )
				.catch( () => {
					expect( dispatch ).to.have.been.calledWith( failCommentContentUpdateRequest( 101010, 20, '' ) );
				} );
		} );
	} );
} );
