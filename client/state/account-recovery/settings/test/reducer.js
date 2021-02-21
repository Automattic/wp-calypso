/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { dummyData, dummyNewPhone, dummyNewEmail } from './test-data';
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

		assert.deepEqual( initState.data, expectedState );
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

		assert.deepEqual( state.data, {
			...initState.data,
			phone: newPhoneValue,
		} );
	} );

	test( 'ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS action with phone target should wipe the phone field', () => {
		const state = reducer( initState, {
			type: ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS,
			target: 'phone',
		} );

		assert.isNull( state.data.phone );
	} );

	test( 'ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS action with email target should update the email field', () => {
		const state = reducer( initState, {
			type: ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS,
			target: 'email',
			value: dummyNewEmail,
		} );

		assert.equal( state.data.email, dummyNewEmail );
	} );

	test( 'ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS action with email target should wipe the email field', () => {
		const state = reducer( initState, {
			type: ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS,
			target: 'email',
		} );

		assert.equal( state.data.email, '' );
	} );

	const arbitraryTargetName = 'whatever';

	test( 'ACCOUNT_RECOVERY_SETTINGS_UPDATE action should set the isUpdating sub field', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_UPDATE,
			target: arbitraryTargetName,
		} );

		assert.isTrue( state.isUpdating[ arbitraryTargetName ] );
	} );

	test( 'ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS action should unset the isUpdating sub field', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS,
			target: arbitraryTargetName,
		} );

		assert.isFalse( state.isUpdating[ arbitraryTargetName ] );
	} );

	test( 'ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS action should set the hasSentValidation sub field', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS,
			target: arbitraryTargetName,
		} );

		assert.isTrue( state.hasSentValidation[ arbitraryTargetName ] );
	} );

	test( 'ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED action should unset the isUpdating sub field', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED,
			target: arbitraryTargetName,
		} );

		assert.isFalse( state.isUpdating[ arbitraryTargetName ] );
	} );

	test( 'ACCOUNT_RECOVERY_SETTINS_DELETE action should set the isDeleting sub field', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_DELETE,
			target: arbitraryTargetName,
		} );

		assert.isTrue( state.isDeleting[ arbitraryTargetName ] );
	} );

	test( 'ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS action should unset the isDeleting sub field', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS,
			target: arbitraryTargetName,
		} );

		assert.isFalse( state.isDeleting[ arbitraryTargetName ] );
	} );

	test( 'ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED action should unset the isDeleting sub field', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED,
			target: arbitraryTargetName,
		} );

		assert.isFalse( state.isDeleting[ arbitraryTargetName ] );
	} );

	test( 'ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION action should set hasSentValidation sub field', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION,
			target: arbitraryTargetName,
		} );

		assert.isTrue( state.hasSentValidation[ arbitraryTargetName ] );
	} );

	test( 'ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_SUCCESS action should set phoneValidated as true', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_SUCCESS,
		} );

		assert.isTrue( state.data.phoneValidated );
	} );

	test( 'ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE action should set isValidatingPhone as true', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE,
		} );

		assert.isTrue( state.isValidatingPhone );
	} );

	test( 'ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_SUCCESS action should set isValidatingPhone as false', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_SUCCESS,
		} );

		assert.isFalse( state.isValidatingPhone );
	} );

	test( 'ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE action should set isValidatingPhone as false', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_FAILED,
		} );

		assert.isFalse( state.isValidatingPhone );
	} );
} );
