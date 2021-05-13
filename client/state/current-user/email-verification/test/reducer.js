/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer, { status, errorMessage } from '../reducer';
import {
	EMAIL_VERIFY_REQUEST,
	EMAIL_VERIFY_REQUEST_SUCCESS,
	EMAIL_VERIFY_REQUEST_FAILURE,
	EMAIL_VERIFY_STATE_RESET,
} from 'calypso/state/action-types';

describe( 'reducer', () => {
	test( 'exports expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [ 'status', 'errorMessage' ] );
	} );

	describe( '#status', () => {
		test( 'returns null by default', () => {
			const result = status( undefined, { type: 'DUMMY' } );
			expect( result ).to.equal( null );
		} );

		test( 'returns "requesting" when a request is made', () => {
			const result = status( undefined, { type: EMAIL_VERIFY_REQUEST } );
			expect( result ).to.equal( 'requesting' );
		} );

		test( 'returns "sent" when email is sent', () => {
			const result = status( undefined, { type: EMAIL_VERIFY_REQUEST_SUCCESS } );
			expect( result ).to.equal( 'sent' );
		} );

		test( 'returns "error" when there is an error sending an email', () => {
			const result = status( undefined, { type: EMAIL_VERIFY_REQUEST_FAILURE } );
			expect( result ).to.equal( 'error' );
		} );

		test( 'returns null when the status is reset', () => {
			const result = status( 'original state', { type: EMAIL_VERIFY_STATE_RESET } );
			expect( result ).to.equal( null );
		} );
	} );

	describe( '#errorMessage', () => {
		test( 'returns an empty string by default', () => {
			const result = errorMessage( undefined, { type: 'DUMMY' } );
			expect( result ).to.equal( '' );
		} );

		test( 'returns an empty string when a request is made', () => {
			const result = errorMessage( undefined, { type: EMAIL_VERIFY_REQUEST } );
			expect( result ).to.equal( '' );
		} );

		test( 'returns an empty string when email is sent', () => {
			const result = errorMessage( undefined, { type: EMAIL_VERIFY_REQUEST_SUCCESS } );
			expect( result ).to.equal( '' );
		} );

		test( 'returns the error message when there is an error sending an email', () => {
			const message = 'This is an error message';
			const result = errorMessage( undefined, { type: EMAIL_VERIFY_REQUEST_FAILURE, message } );
			expect( result ).to.equal( message );
		} );

		test( 'returns an empty string when the state is reset', () => {
			const result = errorMessage( 'original state', { type: EMAIL_VERIFY_STATE_RESET } );
			expect( result ).to.equal( '' );
		} );
	} );
} );
