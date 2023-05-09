import {
	ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_UPDATE,
	ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED,
	ACCOUNT_RECOVERY_SETTINGS_DELETE,
	ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED,
	ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION,
	ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE,
	ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_FAILED,
} from 'calypso/state/action-types';
import reducer from '../reducer';
import { dummyData, dummyNewPhone, dummyNewEmail } from './test-data';

describe( '#account-recovery reducer fetch:', () => {
	const expectedState = {
		email: dummyData.email,
		emailValidated: dummyData.email_validated,
		phone: {
			countryCode: dummyData.phone.country_code,
			countryNumericCode: dummyData.phone.country_numeric_code,
			number: dummyData.phone.number,
			numberFull: dummyData.phone.number_full,
		},

		phoneValidated: dummyData.phone_validated,
	};

	test( 'should return an initial object with the settings data.', () => {
		const initState = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS,
			settings: dummyData,
		} );

		expect( initState.data ).toEqual( expectedState );
	} );
} );

describe( '#account-recovery/settings reducer:', () => {
	let initState;

	beforeEach( () => {
		initState = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS,
			settings: dummyData,
		} );
	} );

	test( 'ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS action with phone target should update the phone field', () => {
		const newPhoneValue = {
			countryCode: dummyNewPhone.country_code,
			countryNumericCode: dummyNewPhone.country_numeric_code,
			number: dummyNewPhone.number,
			numberFull: dummyNewPhone.number_full,
		};

		const state = reducer( initState, {
			type: ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS,
			target: 'phone',
			value: newPhoneValue,
		} );

		expect( state.data ).toEqual( {
			...initState.data,
			phone: newPhoneValue,
		} );
	} );

	test( 'ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS action with phone target should wipe the phone field', () => {
		const state = reducer( initState, {
			type: ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS,
			target: 'phone',
		} );

		expect( state.data.phone ).toBeNull();
	} );

	test( 'ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS action with email target should update the email field', () => {
		const state = reducer( initState, {
			type: ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS,
			target: 'email',
			value: dummyNewEmail,
		} );

		expect( state.data.email ).toEqual( dummyNewEmail );
	} );

	test( 'ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS action with email target should wipe the email field', () => {
		const state = reducer( initState, {
			type: ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS,
			target: 'email',
		} );

		expect( state.data.email ).toEqual( '' );
	} );

	const arbitraryTargetName = 'whatever';

	test( 'ACCOUNT_RECOVERY_SETTINGS_UPDATE action should set the isUpdating sub field', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_UPDATE,
			target: arbitraryTargetName,
		} );

		expect( state.isUpdating[ arbitraryTargetName ] ).toBe( true );
	} );

	test( 'ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS action should unset the isUpdating sub field', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS,
			target: arbitraryTargetName,
		} );

		expect( state.isUpdating[ arbitraryTargetName ] ).toBe( false );
	} );

	test( 'ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS action should set the hasSentValidation sub field', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS,
			target: arbitraryTargetName,
		} );

		expect( state.hasSentValidation[ arbitraryTargetName ] ).toBe( true );
	} );

	test( 'ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED action should unset the isUpdating sub field', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED,
			target: arbitraryTargetName,
		} );

		expect( state.isUpdating[ arbitraryTargetName ] ).toBe( false );
	} );

	test( 'ACCOUNT_RECOVERY_SETTINS_DELETE action should set the isDeleting sub field', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_DELETE,
			target: arbitraryTargetName,
		} );

		expect( state.isDeleting[ arbitraryTargetName ] ).toBe( true );
	} );

	test( 'ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS action should unset the isDeleting sub field', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS,
			target: arbitraryTargetName,
		} );

		expect( state.isDeleting[ arbitraryTargetName ] ).toBe( false );
	} );

	test( 'ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED action should unset the isDeleting sub field', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED,
			target: arbitraryTargetName,
		} );

		expect( state.isDeleting[ arbitraryTargetName ] ).toBe( false );
	} );

	test( 'ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION action should set hasSentValidation sub field', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION,
			target: arbitraryTargetName,
		} );

		expect( state.hasSentValidation[ arbitraryTargetName ] ).toBe( true );
	} );

	test( 'ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_SUCCESS action should set phoneValidated as true', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_SUCCESS,
		} );

		expect( state.data.phoneValidated ).toBe( true );
	} );

	test( 'ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE action should set isValidatingPhone as true', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE,
		} );

		expect( state.isValidatingPhone ).toBe( true );
	} );

	test( 'ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_SUCCESS action should set isValidatingPhone as false', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_SUCCESS,
		} );

		expect( state.isValidatingPhone ).toBe( false );
	} );

	test( 'ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE action should set isValidatingPhone as false', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_FAILED,
		} );

		expect( state.isValidatingPhone ).toBe( false );
	} );
} );
