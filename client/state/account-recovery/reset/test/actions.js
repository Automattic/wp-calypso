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
	requestReset,
	requestResetSuccess,
	requestResetError,
	updatePasswordResetUserData,
} from '../actions';

import {
	ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST,
	ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
	ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
	ACCOUNT_RECOVERY_RESET_REQUEST,
	ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS,
	ACCOUNT_RECOVERY_RESET_REQUEST_ERROR,
	ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
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

describe( '#requestResetSuccess', () => {
	it( 'should return action ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS', () => {
		const action = requestResetSuccess();

		assert.deepEqual( action, {
			type: ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS,
		} );
	} );
} );

describe( '#requestResetError', () => {
	it( 'should return action ACCOUNT_RECOVERY_RESET_REQUEST_ERROR with error field', () => {
		const error = {
			status: 404,
			message: 'Error!',
		};

		const action = requestResetError( error );

		assert.deepEqual( action, {
			type: ACCOUNT_RECOVERY_RESET_REQUEST_ERROR,
			error,
		} );
	} );
} );

describe( '#requestReset', () => {
	it( 'should return action ACCOUNT_RECOVERY_RESET_REQUET_RESET', () => {
		const request = {
			user: 'foo',
			method: 'primary_email',
		};

		const action = requestReset( request );

		assert.deepEqual( action, {
			type: ACCOUNT_RECOVERY_RESET_REQUEST,
			request,
		} );
	} );
} );
