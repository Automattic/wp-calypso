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
	requestingPostComments,
	receivePostComments,
	successPostCommentsRequest,
	receivePostCommentsCount,
	failPostCommentsRequest
} from 'state/discussions/actions';
import { requestDiscussions } from '../';

describe( 'wpcom-api', () => {
	let dispatch;

	useSandbox( sandbox => ( dispatch = sandbox.spy() ) );

	describe( 'post comments request', () => {
		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/sites/101010/posts/10/replies/' )
				.query( { status: 'all' } )
				.reply( 200, { comments: [], found: 4 } )
				.get( '/rest/v1.1/sites/101010/posts/10/replies/' )
				.query( { status: 'error' } )
				.reply( 403, { error: 'error', message: 'error_message' } );
		} );

		it( 'should not dispatch any action if a request for the specified site and post is in flight' );

		it( 'should dispatch requesting action when the request triggers', () => {
			requestDiscussions( { dispatch }, { siteId: 101010, postId: 10, status: 'all' } );
			expect( dispatch ).to.have.been.calledWith( requestingPostComments( 101010, 10, 'all' ) );
		} );

		it( 'should dispatch a receive posts action whe the request completes', () => {
			return requestDiscussions( { dispatch }, { siteId: 101010, postId: 10, status: 'all' } )
				.then( () => {
					expect( dispatch ).to.have.been.calledWith( receivePostComments( 101010, [] ) );
				} );
		} );

		it( 'should dispatch a success request action whe the request completes', () => {
			return requestDiscussions( { dispatch }, { siteId: 101010, postId: 10, status: 'all' } )
				.then( () => {
					expect( dispatch ).to.have.been.calledWith( successPostCommentsRequest( 101010, 10, 'all' ) );
				} );
		} );

		it( 'should dispatch a receive post comments count action whe the request completes', () => {
			return requestDiscussions( { dispatch }, { siteId: 101010, postId: 10, status: 'all' } )
				.then( () => {
					expect( dispatch ).to.have.been.calledWith( receivePostCommentsCount( 101010, 10, 4 ) );
				} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return requestDiscussions( { dispatch }, { siteId: 101010, postId: 10, status: 'error' } )
				.catch( () => {
					expect( dispatch ).to.have.been.calledWith( failPostCommentsRequest( 101010, 10, 'error' ) );
				} );
		} );
	} );
} );
