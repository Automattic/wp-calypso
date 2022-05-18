import {
	EMAIL_VERIFY_REQUEST,
	EMAIL_VERIFY_REQUEST_SUCCESS,
	EMAIL_VERIFY_REQUEST_FAILURE,
	EMAIL_VERIFY_STATE_RESET,
} from 'calypso/state/action-types';
import reducer, { status, errorMessage } from '../reducer';

describe( 'reducer', () => {
	test( 'exports expected reducer keys', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual(
			expect.arrayContaining( [ 'status', 'errorMessage' ] )
		);
	} );

	describe( '#status', () => {
		test( 'returns null by default', () => {
			const result = status( undefined, { type: 'DUMMY' } );
			expect( result ).toBeNull();
		} );

		test( 'returns "requesting" when a request is made', () => {
			const result = status( undefined, { type: EMAIL_VERIFY_REQUEST } );
			expect( result ).toEqual( 'requesting' );
		} );

		test( 'returns "sent" when email is sent', () => {
			const result = status( undefined, { type: EMAIL_VERIFY_REQUEST_SUCCESS } );
			expect( result ).toEqual( 'sent' );
		} );

		test( 'returns "error" when there is an error sending an email', () => {
			const result = status( undefined, { type: EMAIL_VERIFY_REQUEST_FAILURE } );
			expect( result ).toEqual( 'error' );
		} );

		test( 'returns null when the status is reset', () => {
			const result = status( 'original state', { type: EMAIL_VERIFY_STATE_RESET } );
			expect( result ).toBeNull();
		} );
	} );

	describe( '#errorMessage', () => {
		test( 'returns an empty string by default', () => {
			const result = errorMessage( undefined, { type: 'DUMMY' } );
			expect( result ).toEqual( '' );
		} );

		test( 'returns an empty string when a request is made', () => {
			const result = errorMessage( undefined, { type: EMAIL_VERIFY_REQUEST } );
			expect( result ).toEqual( '' );
		} );

		test( 'returns an empty string when email is sent', () => {
			const result = errorMessage( undefined, { type: EMAIL_VERIFY_REQUEST_SUCCESS } );
			expect( result ).toEqual( '' );
		} );

		test( 'returns the error message when there is an error sending an email', () => {
			const message = 'This is an error message';
			const result = errorMessage( undefined, { type: EMAIL_VERIFY_REQUEST_FAILURE, message } );
			expect( result ).toEqual( message );
		} );

		test( 'returns an empty string when the state is reset', () => {
			const result = errorMessage( 'original state', { type: EMAIL_VERIFY_STATE_RESET } );
			expect( result ).toEqual( '' );
		} );
	} );
} );
