/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer, { isUploading, tempImage } from '../reducer';
import {
	GRAVATAR_UPLOAD_RECEIVE,
	GRAVATAR_UPLOAD_REQUEST,
	GRAVATAR_UPLOAD_REQUEST_SUCCESS,
	GRAVATAR_UPLOAD_REQUEST_FAILURE,
	SERIALIZE,
	DESERIALIZE,
} from 'calypso/state/action-types';

describe( 'reducer', () => {
	test( 'exports expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [ 'isUploading', 'tempImage' ] );
	} );

	describe( '#isUploading', () => {
		test( 'returns false by default', () => {
			const state = isUploading( undefined, {} );
			expect( state ).to.equal( false );
		} );

		test( 'returns true when request is made', () => {
			expect(
				isUploading( false, {
					type: GRAVATAR_UPLOAD_REQUEST,
				} )
			).to.equal( true );
		} );

		test( 'returns false when request succeeds', () => {
			expect(
				isUploading( true, {
					type: GRAVATAR_UPLOAD_REQUEST_SUCCESS,
				} )
			).to.equal( false );
		} );

		test( 'returns false when request fails', () => {
			expect(
				isUploading( true, {
					type: GRAVATAR_UPLOAD_REQUEST_FAILURE,
				} )
			).to.equal( false );
		} );

		test( 'never persists loading state', () => {
			expect(
				isUploading( true, {
					type: SERIALIZE,
				} )
			).to.be.undefined;

			expect(
				isUploading( true, {
					type: DESERIALIZE,
				} )
			).to.equal( false );
		} );
	} );

	describe( '#tempImage', () => {
		const imageSrc = 'image';

		test( 'returns empty object by default', () => {
			const state = tempImage( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		test( 'returns object with image src when response is received', () => {
			const state = tempImage( undefined, {
				type: GRAVATAR_UPLOAD_RECEIVE,
				src: imageSrc,
			} );
			expect( state ).to.eql( {
				src: imageSrc,
			} );
		} );

		test( 'never persists state', () => {
			const state = {
				src: imageSrc,
			};
			expect( tempImage( state, { type: SERIALIZE } ) ).to.be.undefined;
			expect( tempImage( state, { type: DESERIALIZE } ) ).to.eql( {} );
		} );
	} );
} );
