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
	requestingCommentLike,
	sucessCommentLikeRequest,
	failCommentLikeRequest,
} from 'state/discussions/actions';
import { requestCommentLike, requestCommentUnLike } from '../';

describe( 'wpcom-api', () => {
	let dispatch;

	useSandbox( sandbox => ( dispatch = sandbox.spy() ) );

	useNock( nock => {
		nock( 'https://public-api.wordpress.com:443' )
			.persist()
			.post( '/rest/v1.1/sites/101010/comments/20/likes/new', { source: 'reader' } )
			.reply( 200, {
				i_like: true,
				like_count: 5
			} )
			.post( '/rest/v1.1/sites/101010/comments/20/likes/mine/delete' )
			.query( { source: 'reader' } )
			.reply( 200, {
				success: true,
				i_like: false,
				like_count: 5
			} )
			.post( '/rest/v1.1/sites/101010/comments/20/likes/new', { source: 'error' } )
			.reply( 403, { error: 'error', message: 'error_message' } )
			.post( '/rest/v1.1/sites/101010/comments/20/likes/mine/delete' )
			.query( { source: 'error' } )
			.reply( 403, { error: 'error', message: 'error_message' } );
	} );

	describe( 'comment like request', () => {
		it( 'should not dispatch any action if a request for the specified site and post is in flight' );

		it( 'should dispatch requesting action when the request triggers', () => {
			requestCommentLike( { dispatch }, { siteId: 101010, commentId: 20, source: 'reader' } );
			expect( dispatch ).to.have.been.calledWith( requestingCommentLike( 101010, 20, 'reader' ) );
		} );

		it( 'should dispatch a success request action when the request completes', () => {
			return requestCommentLike( { dispatch }, { siteId: 101010, commentId: 20, source: 'reader' } )
				.then( () => {
					expect( dispatch ).to.have.been.calledWith( sucessCommentLikeRequest( 101010, 20, 'reader', true, 5 ) );
				} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return requestCommentLike( { dispatch }, { siteId: 101010, commentId: 20, source: 'error' } )
				.catch( () => {
					expect( dispatch ).to.have.been.calledWith( failCommentLikeRequest( 101010, 20, 'error' ) );
				} );
		} );
	} );

	describe( 'comment unlike request', () => {
		it( 'should not dispatch any action if a request for the specified site and post is in flight' );

		it( 'should dispatch requesting action when the request triggers', () => {
			requestCommentUnLike( { dispatch }, { siteId: 101010, commentId: 20, source: 'reader' } );
			expect( dispatch ).to.have.been.calledWith( requestingCommentLike( 101010, 20, 'reader' ) );
		} );

		it( 'should dispatch a success request action when the request completes', () => {
			return requestCommentUnLike( { dispatch }, { siteId: 101010, commentId: 20, source: 'reader' } )
				.then( () => {
					expect( dispatch ).to.have.been.calledWith( sucessCommentLikeRequest( 101010, 20, 'reader', false, 5 ) );
				} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return requestCommentUnLike( { dispatch }, { siteId: 101010, commentId: 20, source: 'error' } )
				.catch( () => {
					expect( dispatch ).to.have.been.calledWith( failCommentLikeRequest( 101010, 20, 'error' ) );
				} );
		} );
	} );
} );
