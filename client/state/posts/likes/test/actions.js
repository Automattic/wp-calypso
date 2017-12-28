/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { requestPostLikes } from '../actions';
import {
	POST_LIKES_RECEIVE,
	POST_LIKES_REQUEST,
	POST_LIKES_REQUEST_SUCCESS,
	POST_LIKES_REQUEST_FAILURE,
} from 'client/state/action-types';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'actions', () => {
	let spy;
	useSandbox( sandbox => ( spy = sandbox.spy() ) );

	describe( 'requestPostLikes()', () => {
		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/sites/12345678/posts/50/likes' )
				.reply( 200, {
					likes: [ { id: 1, login: 'chicken' } ],
					found: 2,
					i_like: false,
				} )
				.get( '/rest/v1.1/sites/87654321/posts/50/likes' )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.',
				} );
		} );

		test( 'should dispatch fetch action when thunk triggered', () => {
			requestPostLikes( 12345678, 50 )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: POST_LIKES_REQUEST,
				siteId: 12345678,
				postId: 50,
			} );
		} );

		test( 'should dispatch receive action when request completes', () => {
			return requestPostLikes( 12345678, 50 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POST_LIKES_RECEIVE,
					siteId: 12345678,
					postId: 50,
					likes: [ { id: 1, login: 'chicken' } ],
					found: 2,
					iLike: false,
				} );
			} );
		} );

		test( 'should dispatch request success action when request completes', () => {
			return requestPostLikes( 12345678, 50 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POST_LIKES_REQUEST_SUCCESS,
					siteId: 12345678,
					postId: 50,
				} );
			} );
		} );

		test( 'should dispatch request failure action when request fails', () => {
			return requestPostLikes( 87654321, 50 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POST_LIKES_REQUEST_FAILURE,
					siteId: 87654321,
					postId: 50,
					error: sinon.match( {
						message: 'User cannot access this private blog.',
					} ),
				} );
			} );
		} );
	} );
} );
