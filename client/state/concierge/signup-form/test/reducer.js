/** @format */

/**
 * External dependencies
 */
import moment from 'moment-timezone';

/**
 * Internal dependencies
 */
import signupForm, {
	firstname,
	lastname,
	timezone,
	message,
	phoneNumber,
	status,
	isRebrandCitiesSite,
} from '../reducer';
import { CONCIERGE_SIGNUP_FORM_UPDATE, CONCIERGE_UPDATE_BOOKING_STATUS } from 'state/action-types';

describe( 'concierge/signupForm/reducer', () => {
	const mockSignupForm = {
		firstname: 'Foo',
		lastname: 'Bar',
		timezone: 'UTC',
		message: 'hello',
		phoneNumber: '0123456789',
		status: 'booking',
		isRebrandCitiesSite: true,
	};
	const mockStatus = 'booking';

	const updateForm = {
		type: CONCIERGE_SIGNUP_FORM_UPDATE,
		signupForm: mockSignupForm,
	};

	const updateStatus = {
		type: CONCIERGE_UPDATE_BOOKING_STATUS,
		status: mockStatus,
	};

	describe( 'firstname', () => {
		test( 'should be default as empty string.', () => {
			expect( firstname( undefined, {} ) ).toEqual( '' );
		} );

		test( 'should return the firstname of the update action.', () => {
			expect( firstname( {}, updateForm ) ).toEqual( mockSignupForm.firstname );
		} );
	} );

	describe( 'lastname', () => {
		test( 'should be default as empty string.', () => {
			expect( lastname( undefined, {} ) ).toEqual( '' );
		} );

		test( 'should return the lastname of the update action.', () => {
			expect( lastname( {}, updateForm ) ).toEqual( mockSignupForm.lastname );
		} );
	} );

	describe( 'timezone', () => {
		test( 'should use the default detected timezone.', () => {
			expect( timezone( undefined, {} ) ).toEqual( moment.tz.guess() );
		} );

		test( 'should return the timezone of the update action', () => {
			expect( timezone( {}, updateForm ) ).toEqual( mockSignupForm.timezone );
		} );
	} );

	describe( 'message', () => {
		test( 'should be defaulted as empty string.', () => {
			expect( message( undefined, {} ) ).toEqual( '' );
		} );

		test( 'should return the message of the update action', () => {
			expect( message( {}, updateForm ) ).toEqual( mockSignupForm.message );
		} );
	} );

	describe( 'phoneNumber', () => {
		test( 'should be defaulted as empty string.', () => {
			expect( phoneNumber( undefined, {} ) ).toEqual( '' );
		} );

		test( 'should return the phone number of the update action', () => {
			expect( phoneNumber( {}, updateForm ) ).toEqual( mockSignupForm.phoneNumber );
		} );
	} );

	describe( 'status', () => {
		test( 'should be defaulted as null', () => {
			expect( status( undefined, {} ) ).toBeNull();
		} );

		test( 'should return the status of the update action', () => {
			expect( status( {}, updateStatus ) ).toEqual( mockStatus );
		} );
	} );

	describe( 'isRebrandCitiesSite', () => {
		test( 'should be defaulted as false', () => {
			expect( isRebrandCitiesSite( undefined, {} ) ).toBe( false );
		} );

		test( 'should return isRebrandCitiesSite from the update action', () => {
			expect( isRebrandCitiesSite( undefined, updateForm ) ).toEqual(
				mockSignupForm.isRebrandCitiesSite
			);
		} );
	} );

	describe( 'signupForm', () => {
		test( 'should combine all defaults as null.', () => {
			expect( signupForm( undefined, {} ) ).toEqual( {
				firstname: '',
				lastname: '',
				timezone: moment.tz.guess(),
				message: '',
				phoneNumber: '',
				status: null,
				isRebrandCitiesSite: false,
			} );
		} );

		test( 'should return the proper message and timezone of the update action', () => {
			const expectedFields = {
				...mockSignupForm,
				status: null,
			};
			expect( signupForm( {}, updateForm ) ).toEqual( expectedFields );
		} );
	} );
} );
