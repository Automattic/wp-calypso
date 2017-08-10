/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	EMAIL_VERIFY_REQUEST,
	EMAIL_VERIFY_REQUEST_SUCCESS,
	EMAIL_VERIFY_REQUEST_FAILURE,
	EMAIL_VERIFY_STATE_RESET,
} from 'state/action-types';
import reducer, { status, errorMessage } from '../reducer';

describe( 'reducer', () => {
	it( 'exports expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [ 'status', 'errorMessage' ] );
	} );

	describe( '#status', () => {
		it( 'returns null by default', () => {
			const result = status( undefined, { type: 'DUMMY' } );
			expect( result ).to.equal( null );
		} );

		it( 'returns "requesting" when a request is made', () => {
			const result = status( undefined, { type: EMAIL_VERIFY_REQUEST } );
			expect( result ).to.equal( 'requesting' );
		} );

		it( 'returns "sent" when email is sent', () => {
			const result = status( undefined, { type: EMAIL_VERIFY_REQUEST_SUCCESS } );
			expect( result ).to.equal( 'sent' );
		} );

		it( 'returns "error" when there is an error sending an email', () => {
			const result = status( undefined, { type: EMAIL_VERIFY_REQUEST_FAILURE } );
			expect( result ).to.equal( 'error' );
		} );

		it( 'returns null when the status is reset', () => {
			const result = status( 'original state', { type: EMAIL_VERIFY_STATE_RESET } );
			expect( result ).to.equal( null );
		} );
	} );

	describe( '#errorMessage', () => {
		it( 'returns an empty string by default', () => {
			const result = errorMessage( undefined, { type: 'DUMMY' } );
			expect( result ).to.equal( '' );
		} );

		it( 'returns an empty string when a request is made', () => {
			const result = errorMessage( undefined, { type: EMAIL_VERIFY_REQUEST } );
			expect( result ).to.equal( '' );
		} );

		it( 'returns an empty string when email is sent', () => {
			const result = errorMessage( undefined, { type: EMAIL_VERIFY_REQUEST_SUCCESS } );
			expect( result ).to.equal( '' );
		} );

		it( 'returns the error message when there is an error sending an email', () => {
			const message = 'This is an error message';
			const result = errorMessage( undefined, { type: EMAIL_VERIFY_REQUEST_FAILURE, message } );
			expect( result ).to.equal( message );
		} );

		it( 'returns an empty string when the state is reset', () => {
			const result = errorMessage( 'original state', { type: EMAIL_VERIFY_STATE_RESET } );
			expect( result ).to.equal( '' );
		} );
	} );
} );
