/**
 * External dependencies
 */
import sinon from 'sinon';
import { expect } from 'chai';
import { useSandbox } from 'test/helpers/use-sinon';
import useNock from 'test/helpers/use-nock';

/**
 * Internal dependencies
 */
import {
	POST_FORMATS_RECEIVE,
	POST_FORMATS_REQUEST,
	POST_FORMATS_REQUEST_SUCCESS,
	POST_FORMATS_REQUEST_FAILURE,
} from 'state/action-types';
import { requestPostFormats } from '../actions';

describe( 'actions', () => {
	let spy;
	useSandbox( sandbox => spy = sandbox.spy() );

	describe( '#requestPostFormats()', () => {
		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/sites/12345678/post-formats' )
				.reply( 200, {
					formats: {
						image: 'Image',
						video: 'Video',
						link: 'Link',
					},
				} )
				.get( '/rest/v1.1/sites/87654321/post-formats' )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.',
				} );
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			requestPostFormats( 12345678 )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: POST_FORMATS_REQUEST,
				siteId: 12345678,
			} );
		} );

		it( 'should dispatch receive action when request completes', () => {
			return requestPostFormats( 12345678 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POST_FORMATS_RECEIVE,
					siteId: 12345678,
					formats: {
						image: 'Image',
						video: 'Video',
						link: 'Link',
					},
				} );
			} );
		} );

		it( 'should dispatch request success action when request completes', () => {
			return requestPostFormats( 12345678 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POST_FORMATS_REQUEST_SUCCESS,
					siteId: 12345678,
				} );
			} );
		} );

		it( 'should dispatch request failure action when request fails', () => {
			return requestPostFormats( 87654321 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POST_FORMATS_REQUEST_FAILURE,
					siteId: 87654321,
					error: sinon.match( {
						message: 'User cannot access this private blog.',
					} ),
				} );
			} );
		} );
	} );
} );
