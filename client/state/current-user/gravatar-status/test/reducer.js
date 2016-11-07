/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	GRAVATAR_UPLOAD_REQUEST,
	GRAVATAR_UPLOAD_REQUEST_SUCCESS,
	GRAVATAR_UPLOAD_REQUEST_FAILURE,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import reducer, {
	isUploading
} from '../reducer';

describe( 'reducer', () => {
	it( 'exports expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'isUploading',
		] );
	} );

	describe( '#isUploading', () => {
		it( 'returns false by default', () => {
			const state = isUploading( undefined, {} );
			expect( state ).to.equal( false );
		} );

		it( 'returns true when request is made', () => {
			expect( isUploading( false, {
				type: GRAVATAR_UPLOAD_REQUEST
			} ) ).to.equal( true );
		} );

		it( 'returns false when request succeeds', () => {
			expect( isUploading( true, {
				type: GRAVATAR_UPLOAD_REQUEST_SUCCESS
			} ) ).to.equal( false );
		} );

		it( 'returns false when request fails', () => {
			expect( isUploading( true, {
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
} );
