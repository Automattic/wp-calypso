/** @format */

/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import {
	ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
	ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
	ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST,
	ACCOUNT_RECOVERY_RESET_REQUEST,
	ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS,
	ACCOUNT_RECOVERY_RESET_REQUEST_ERROR,
	ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
	ACCOUNT_RECOVERY_RESET_SET_METHOD,
	ACCOUNT_RECOVERY_RESET_SET_VALIDATION_KEY,
	ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST,
	ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST_SUCCESS,
	ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST_ERROR,
	ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST,
	ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_SUCCESS,
	ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_ERROR,
} from 'state/action-types';

describe( '#account-recovery/reset reducer', () => {
	const fetchedOptions = deepFreeze( [
		{
			email: 'primary@example.com',
			sms: '123456789',
		},
		{
			email: 'secondary@example.com',
			sms: '123456789',
		},
	] );

	test( 'ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST action should set isRequesting flag.', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST,
		} );

		expect( state.options.isRequesting ).toBe( true );
	} );

	const hasItemsState = deepFreeze( {
		options: {
			items: fetchedOptions,
		},
	} );

	test( 'ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST action should delete the previous items.', () => {
		const state = reducer( hasItemsState, {
			type: ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST,
		} );

		expect( state.options.items ).toEqual( [] );
	} );

	test( 'ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR action should delete the previous items.', () => {
		const state = reducer( hasItemsState, {
			type: ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
			error: {},
		} );

		expect( state.options.items ).toEqual( [] );
	} );

	const requestingState = deepFreeze( {
		options: {
			isRequesting: true,
		},
	} );

	test( 'ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE action should unset isRequesting flag.', () => {
		const state = reducer( requestingState, {
			type: ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
			items: [],
		} );

		expect( state.options.isRequesting ).toBe( false );
	} );

	test( 'ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR action should unset isRequesting flag.', () => {
		const state = reducer( requestingState, {
			type: ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
			error: {},
		} );

		expect( state.options.isRequesting ).toBe( false );
	} );

	test( 'ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE action should populate the items field.', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
			items: fetchedOptions,
		} );

		expect( state.options.items ).toEqual( fetchedOptions );
	} );

	const mockError = deepFreeze( {
		status: 400,
		message: 'Something wrong!',
	} );

	test( 'ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR action should populate the error field.', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
			error: mockError,
		} );

		expect( state.options.error ).toEqual( mockError );
	} );

	test( 'ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA action should populate the userData field.', () => {
		const userData = deepFreeze( {
			user: 'userlogin',
			firstname: 'Foo',
			lastname: 'Bar',
			url: 'examples.com',
		} );
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
			userData,
		} );

		expect( state.userData ).toEqual( userData );
	} );

	test( 'ACCOUNT_RECOVERY_RESET_SET_METHOD action should populate the method field', () => {
		const method = 'primary_email';
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_RESET_SET_METHOD,
			method,
		} );

		expect( state.method ).toEqual( method );
	} );

	test( 'ACCOUNT_RECOVERY_RESET_REQUEST action should set the requesting status flag', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_RESET_REQUEST,
		} );

		expect( state.requestReset.isRequesting ).toBe( true );
	} );

	const requestingResetState = deepFreeze( {
		requestReset: {
			isRequesting: true,
		},
	} );

	test( 'ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS action should unset the requesting status flag', () => {
		const state = reducer( requestingResetState, {
			type: ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS,
		} );

		expect( state.requestReset.isRequesting ).toBe( false );
	} );

	test( 'ACCOUNT_RECOVERY_RESET_REQUEST_ERROR action should unset the requesting status flag', () => {
		const state = reducer( requestingResetState, {
			type: ACCOUNT_RECOVERY_RESET_REQUEST_ERROR,
			error: {},
		} );

		expect( state.requestReset.isRequesting ).toBe( false );
	} );

	test( 'ACCOUNT_RECOVERY_RESET_REQUEST_ERROR action should populate the error field', () => {
		const state = reducer( requestingResetState, {
			type: ACCOUNT_RECOVERY_RESET_REQUEST_ERROR,
			error: mockError,
		} );

		expect( state.requestReset.error ).toEqual( mockError );
	} );

	test( 'ACCOUNT_RECOVERY_RESET_SET_VALIDATION_KEY action should set the key field', () => {
		const key = '5201314';
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_RESET_SET_VALIDATION_KEY,
			key,
		} );

		expect( state.key ).toEqual( key );
	} );

	test( 'ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST action should set the requesting status flag of the validate state tree', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST,
		} );

		expect( state.validate.isRequesting ).toBe( true );
	} );

	const validatingState = deepFreeze( {
		validate: {
			isRequesting: true,
		},
	} );

	test( 'ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST_SUCCESS action should unset the requesting status flag of the validate state tree', () => {
		const state = reducer( validatingState, {
			type: ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST_SUCCESS,
		} );

		expect( state.validate.isRequesting ).toBe( false );
	} );

	test( 'ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST_ERROR action should unset the requesting status flag of the validate state tree', () => {
		const state = reducer( validatingState, {
			type: ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST_ERROR,
			error: {},
		} );

		expect( state.validate.isRequesting ).toBe( false );
	} );

	test( 'ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST_ERROR action should save the error data in the validate state tree', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST_ERROR,
			error: mockError,
		} );

		expect( state.validate.error ).toEqual( mockError );
	} );

	const validateErrorState = deepFreeze( {
		validate: {
			error: mockError,
		},
	} );

	test( 'ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST action should clear the error field of the validate state tree', () => {
		const state = reducer( validateErrorState, {
			type: ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST,
		} );

		expect( state.validate.error ).toBeNull();
	} );

	test( 'ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST_SUCCESS action should clear the error field of the validate state tree', () => {
		const state = reducer( validateErrorState, {
			type: ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST_SUCCESS,
		} );

		expect( state.validate.error ).toBeNull();
	} );

	test( 'ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST action should set the requesting status flag as true.', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST,
		} );

		expect( state.resetPassword.isRequesting ).toBe( true );
	} );

	const requestingResetPasswordState = deepFreeze( {
		resetPassword: {
			isRequesting: true,
		},
	} );

	test( 'ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_SUCCESS action should set the requesting flag as false.', () => {
		const state = reducer( requestingResetPasswordState, {
			type: ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_SUCCESS,
		} );

		expect( state.resetPassword.isRequesting ).toBe( false );
	} );

	test( 'ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_ERROR action should set the requesting flag as false.', () => {
		const state = reducer( requestingResetPasswordState, {
			type: ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_ERROR,
			error: {},
		} );

		expect( state.resetPassword.isRequesting ).toBe( false );
	} );

	test( 'ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_SUCCESS action should set the succeeded flag as true.', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_SUCCESS,
		} );

		expect( state.resetPassword.succeeded ).toBe( true );
	} );

	const resetPasswordSucceededState = deepFreeze( {
		resetPassword: {
			succeeded: true,
		},
	} );

	test( 'ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_ERROR action should set the succeeded flag as false.', () => {
		const state = reducer( resetPasswordSucceededState, {
			type: ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_ERROR,
			error: {},
		} );

		expect( state.resetPassword.succeeded ).toBe( false );
	} );

	test( 'ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST action should set the succeeded flag as false.', () => {
		const state = reducer( resetPasswordSucceededState, {
			type: ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST,
		} );

		expect( state.resetPassword.succeeded ).toBe( false );
	} );

	test( 'ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_ERROR action should populate the error field.', () => {
		const error = {
			status: 400,
			message: 'something wrong.',
		};
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_ERROR,
			error,
		} );

		expect( state.resetPassword.error ).toEqual( error );
	} );

	const resetPasswordErrorState = deepFreeze( {
		resetPassword: {
			error: {
				status: 400,
				message: 'something wrong.',
			},
		},
	} );

	test( 'ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST action should clear the error field.', () => {
		const state = reducer( resetPasswordErrorState, {
			type: ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST,
		} );

		expect( state.resetPassword.error ).toBeNull();
	} );

	test( 'ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_SUCCESS action should clear the error field.', () => {
		const state = reducer( resetPasswordErrorState, {
			type: ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_SUCCESS,
		} );

		expect( state.resetPassword.error ).toBeNull();
	} );
} );
