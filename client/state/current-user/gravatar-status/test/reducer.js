/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	GRAVATAR_UPLOAD_RECEIVE,
	GRAVATAR_UPLOAD_REQUEST,
	GRAVATAR_UPLOAD_REQUEST_SUCCESS,
	GRAVATAR_UPLOAD_REQUEST_FAILURE,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import reducer, {
	isUploading,
	tempImage
} from '../reducer';

describe( 'reducer', () => {
	it( 'exports expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'isUploading',
			'tempImage'
		] );
	} );

	describe( '#isUploading', () => {
		it( 'returns false by default', () => {
			const state = isUploading( undefined, {} );
			expect( state ).to.equal( false );
		} );

		it( 'returns true when request is made', () => {
			expect( isUploading( undefined, {
				type: GRAVATAR_UPLOAD_REQUEST
			} ) ).to.equal( true );

			expect( isUploading( true, {
				type: GRAVATAR_UPLOAD_REQUEST
			} ) ).to.equal( true );

			expect( isUploading( false, {
				type: GRAVATAR_UPLOAD_REQUEST
			} ) ).to.equal( true );
		} );

		it( 'returns false when request succeeds', () => {
			expect( isUploading( undefined, {
				type: GRAVATAR_UPLOAD_REQUEST_SUCCESS
			} ) ).to.equal( false );

			expect( isUploading( true, {
				type: GRAVATAR_UPLOAD_REQUEST_SUCCESS
			} ) ).to.equal( false );

			expect( isUploading( false, {
				type: GRAVATAR_UPLOAD_REQUEST_SUCCESS
			} ) ).to.equal( false );
		} );

		it( 'returns false when request fails', () => {
			expect( isUploading( undefined, {
				type: GRAVATAR_UPLOAD_REQUEST_FAILURE
			} ) ).to.equal( false );

			expect( isUploading( true, {
				type: GRAVATAR_UPLOAD_REQUEST_FAILURE
			} ) ).to.equal( false );

			expect( isUploading( false, {
				type: GRAVATAR_UPLOAD_REQUEST_FAILURE
			} ) ).to.equal( false );
		} );

		it( 'never persists loading state', () => {
			expect( isUploading( true, {
				type: SERIALIZE
			} ) ).to.equal( false );

			expect( isUploading( true, {
				type: DESERIALIZE
			} ) ).to.equal( false );
		} );
	} );

	describe( '#tempImage', () => {
		it( 'returns empty object by default', () => {
			const state = tempImage( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'returns temp image src when response is received', () => {
			const state = tempImage( undefined, {
				type: GRAVATAR_UPLOAD_RECEIVE,
				src: 'imageString'
			} );
			expect( state ).to.eql( {
				src: 'imageString'
			} );
		} );

		it( 'never persists state', () => {
			const state = {
				src: 'imageString'
			};
			expect( tempImage( state, { type: SERIALIZE } ) ).to.eql( {} );
			expect( tempImage( state, { type: DESERIALIZE } ) ).to.eql( {} );
		} );
	} );
} );
