/**
 * External dependencies
 */
import { expect } from 'chai';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import {
	GRAVATAR_RECEIVE_IMAGE_FAILURE,
	GRAVATAR_UPLOAD_RECEIVE,
	GRAVATAR_UPLOAD_REQUEST,
	GRAVATAR_UPLOAD_REQUEST_SUCCESS,
	GRAVATAR_UPLOAD_REQUEST_FAILURE
 } from 'state/action-types';
import {
	receiveGravatarImageFailed,
	uploadGravatar
} from '../actions';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'actions', () => {
	let sandbox, spy;
	const tempImageSrc = 'tempImageSrc';
	useSandbox( newSandbox => {
		sandbox = newSandbox;
		spy = sandbox.spy();
		global.FormData = sandbox.stub().returns( {
			append: noop
		} );
		global.FileReader = sandbox.stub().returns( {
			readAsDataURL: noop,
			addEventListener: function( event, callback ) {
				this.result = tempImageSrc;
				callback();
			}
		} );
	} );

	describe( '#uploadGravatar', () => {
		it( 'dispatches request action when thunk triggered', () => {
			uploadGravatar( 'file', 'bearerToken', 'email' )( spy );
			expect( spy ).to.have.been.calledWith( {
				type: GRAVATAR_UPLOAD_REQUEST
			} );
		} );

		describe( 'successful request', () => {
			useNock( ( nock ) => {
				nock( 'https://api.gravatar.com' )
					.persist()
					.post( '/v1/upload-image' )
					.reply( 200, 'Successful request' );
			} );

			it( 'dispatches receive action', () => {
				return uploadGravatar( 'file', 'bearerToken', 'email' )( spy )
					.then( () => {
						expect( spy ).to.have.been.calledWith( {
							type: GRAVATAR_UPLOAD_RECEIVE,
							src: tempImageSrc
						} );
					} );
			} );

			it( 'dispatches success action', () => {
				return uploadGravatar( 'file', 'bearerToken', 'email' )( spy )
					.then( () => {
						expect( spy ).to.have.been.calledWith( {
							type: GRAVATAR_UPLOAD_REQUEST_SUCCESS
						} );
					} );
			} );
		} );

		describe( 'failed request', () => {
			useNock( ( nock ) => {
				nock( 'https://api.gravatar.com' )
					.post( '/v1/upload-image' )
					.reply( 400, 'Failed request' );
			} );

			it( 'dispatches failure action', () => {
				return uploadGravatar( 'file', 'bearerToken', 'email' )( spy )
					.then( () => {
						expect( spy ).to.have.been.calledWith( {
							type: GRAVATAR_UPLOAD_REQUEST_FAILURE
						} );
					} );
			} );
		} );
	} );

	describe( '#receiveGravatarImageFailed', () => {
		it( 'returns image receive failure action with error message', () => {
			const error = 'error';
			const result = receiveGravatarImageFailed( error );
			expect( result ).to.eql( {
				type: GRAVATAR_RECEIVE_IMAGE_FAILURE,
				errorMessage: error
			} );
		} );
	} );
} );
