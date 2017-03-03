/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';

import {
	fetchResetOptions,
	fetchResetOptionsSuccess,
	fetchResetOptionsError,
	updatePasswordResetUserData,
	requestPasswordReset,
	requestPasswordResetSuccess,
	requestPasswordResetError,
} from '../actions';

import {
	ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST,
	ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
	ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
	ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
	ACCOUNT_RECOVERY_RESET_REQUEST,
	ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS,
	ACCOUNT_RECOVERY_RESET_REQUEST_ERROR,
} from 'state/action-types';

describe( '#fetchResetOptionsSuccess', () => {
	it( 'should return ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE action with options field.', () => {
		const items = {
			primaryEmail: 'primary@example.com',
			primarySms: '12345678',
			secondaryEmail: 'secondary@example.com',
			secondarySms: '12345678',
		};

		const action = fetchResetOptionsSuccess( items );

		assert.deepEqual( action, {
			type: ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
			items,
		} );
	} );
} );

describe( '#fetchResetOptionsError', () => {
	it( 'should return ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR action with error field.', () => {
		const error = {
			status: 400,
			message: 'error!',
		};

		const action = fetchResetOptionsError( error );

		assert.deepEqual( action, {
			type: ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
			error,
		} );
	} );
} );

describe( '#fetchResetOptions', () => {
	let spy;

	useSandbox( sandbox => ( spy = sandbox.spy() ) );

	const apiBaseUrl = 'https://public-api.wordpress.com:443';
	const endpoint = '/wpcom/v2/account-recovery/lookup';

	const userData = {
		user: 'foo',
	};

	describe( 'success', () => {
		const response = {
			primary_email: 'a****@example.com',
			secondary_email: 'b*****@example.com',
			primary_sms: '+1******456',
			secondary_sms: '+8*******456',
		};

		useNock( nock => (
			nock( apiBaseUrl )
				.get( endpoint )
				.reply( 200, response )
		) );

		it( 'should dispatch RECEIVE action on success', () => {
			const thunk = fetchResetOptions( userData )( spy );

			assert.isTrue( spy.calledWith( {
				type: ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST,
			} ) );

			return thunk.then( () =>
				assert.isTrue( spy.calledWith( {
					type: ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
					items: [
						{
							email: response.primary_email,
							sms: response.primary_sms,
						},
						{
							email: response.secondary_email,
							sms: response.secondary_sms,
						},
					],
				} ) )
			);
		} );
	} );

	describe( 'failure', () => {
		const errorResponse = {
			status: 400,
			message: 'Something wrong!',
		};

		useNock( nock => (
			nock( apiBaseUrl )
				.get( endpoint )
				.reply( errorResponse.status, errorResponse )
		) );

		it( 'should dispatch ERROR action on failure', () => {
			return fetchResetOptions( userData )( spy )
				.then( () =>
					assert.isTrue( spy.calledWithMatch( {
						type: ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
						error: errorResponse,
					} ) )
				);
		} );
	} );
} );

describe( '#updatePasswordResetUserData', () => {
	it( 'should return ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA action', () => {
		const userData = {
			user: 'foo',
			firstName: 'Foo',
			lastName: 'Bar',
			url: 'test.example.com',
		};
		const action = updatePasswordResetUserData( userData );

		assert.deepEqual( action, {
			type: ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
			userData,
		} );
	} );
} );

describe( '#requestPasswordResetSuccess', () => {
	it( 'should return action ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS', () => {
		const action = requestPasswordResetSuccess();

		assert.deepEqual( action, {
			type: ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS,
		} );
	} );
} );

describe( '#requestPasswordResetError', () => {
	it( 'should return action ACCOUNT_RECOVERY_RESET_REQUEST_ERROR with error field', () => {
		const error = {
			status: 404,
			message: 'Error!',
		};

		const action = requestPasswordResetError( error );

		assert.deepEqual( action, {
			type: ACCOUNT_RECOVERY_RESET_REQUEST_ERROR,
			error,
		} );
	} );
} );

describe( '#requestPasswordReset', () => {
	let spy;

	useSandbox( sandbox => ( spy = sandbox.spy() ) );

	const apiBaseUrl = 'https://public-api.wordpress.com:443';
	const endpoint = '/wpcom/v2/account-recovery/request-reset';

	const request = {
		user: 'foo',
		method: 'primary-email',
	};

	describe( 'success', () => {
		useNock( nock => (
			nock( apiBaseUrl )
				.post( endpoint )
				.reply( 200, { success: true } )
		) );

		it( 'should dispatch SUCCESS action on success', () => {
			const thunk = requestPasswordReset( request )( spy );

			assert.isTrue( spy.calledWith( {
				type: ACCOUNT_RECOVERY_RESET_REQUEST,
			} ) );

			return thunk.then( () =>
				assert.isTrue( spy.calledWith( {
					type: ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS,
				} ) )
			);
		} );
	} );

	describe( 'failure', () => {
		const errorResponse = {
			status: 400,
			message: 'Something wrong!',
		};

		useNock( nock => (
			nock( apiBaseUrl )
				.post( endpoint )
				.reply( errorResponse.status, errorResponse )
		) );

		it( 'should dispatch ERROR action on failure', () => {
			return requestPasswordReset( request )( spy )
				.then( () =>
					assert.isTrue( spy.calledWithMatch( {
						type: ACCOUNT_RECOVERY_RESET_REQUEST_ERROR,
						error: errorResponse,
					} ) )
				);
		} );
	} );
} );
