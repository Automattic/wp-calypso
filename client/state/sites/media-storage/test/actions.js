/**
 * External dependencies
 */
import { expect } from 'chai';
import nock from 'nock';

/**
 * Internal dependencies
 */
import {
	SITE_MEDIA_STORAGE_RECEIVE,
	SITE_MEDIA_STORAGE_REQUEST,
	SITE_MEDIA_STORAGE_REQUEST_SUCCESS,
	SITE_MEDIA_STORAGE_REQUEST_FAILURE
} from 'state/action-types';
import {
	receiveMediaStorage,
	requestMediaStorage
} from '../actions';

import { useSandbox } from 'test/helpers/use-sinon';

describe( 'actions', () => {
	let sandbox, spy;

	useSandbox( newSandbox => {
		sandbox = newSandbox;
		spy = sandbox.spy();
	} );

	describe( '#receiveMediaStorage()', () => {
		it( 'should return an action object', () => {
			const siteId = 2916284;
			const mediaStorage = {
				max_storage_bytes: -1,
				storage_used_bytes: -1
			};
			const action = receiveMediaStorage( mediaStorage, 2916284 );
			expect( action ).to.eql( {
				type: SITE_MEDIA_STORAGE_RECEIVE,
				siteId,
				mediaStorage
			} );
		} );
	} );

	describe( '#receiveMediaStorage()', () => {
		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/sites/2916284/media-storage' )
				.reply( 200, {
					max_storage_bytes: 3221225472,
					storage_used_bytes: 323506
				} )
				.get( '/rest/v1.1/sites/77203074/media-storage' )
				.reply( 403, {
					error: 'authorization_required',
					message: 'An active access token must be used to access media-storage.'
				} );
		} );

		after( () => {
			nock.cleanAll();
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			requestMediaStorage( 2916284 )( spy );
			expect( spy ).to.have.been.calledWith( {
				type: SITE_MEDIA_STORAGE_REQUEST,
				siteId: 2916284
			} );
		} );

		it( 'should dispatch receive action when request completes', () => {
			return requestMediaStorage( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: SITE_MEDIA_STORAGE_RECEIVE,
					mediaStorage: {
						max_storage_bytes: 3221225472,
						storage_used_bytes: 323506
					},
					siteId: 2916284
				} );
			} );
		} );

		it( 'should dispatch success action when request completes', () => {
			return requestMediaStorage( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: SITE_MEDIA_STORAGE_REQUEST_SUCCESS,
					siteId: 2916284
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return requestMediaStorage( 77203074 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: SITE_MEDIA_STORAGE_REQUEST_FAILURE,
					siteId: 77203074,
					error: sandbox.match( { message: 'An active access token must be used to access media-storage.' } )
				} );
			} );
		} );
	} );
} );
