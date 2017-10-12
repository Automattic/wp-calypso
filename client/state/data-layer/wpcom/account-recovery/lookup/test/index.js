/** @format */

/**
 * External dependencies
 */
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { fromApi, validate, requestResetOptionsSuccess, requestResetOptionsError } from '../';
import {
	ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
	ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
	ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
} from 'state/action-types';

const validResponse = {
	primary_email: 'a****@example.com',
	secondary_email: 'b*****@example.com',
	primary_sms: '+1******456',
	secondary_sms: '+8*******456',
};

describe( 'validate()', () => {
	test( 'should validate successfully and throw nothing.', () => {
		expect( () => validate( validResponse ) ).not.toThrow();
	} );

	test( 'should invalidate missing keys and throw an error.', () => {
		expect( () =>
			validate( {
				primary_email: 'foo@example.com',
			} )
		).toThrow();
	} );

	test( 'should invalidate unexpected value type and throw an error', () => {
		expect( () =>
			validate( {
				primary_email: 'foo@example.com',
				primary_sms: '123456',
				secondary_email: 'bar@example.com',
				secondary_sms: 123456,
			} )
		).toThrow();
	} );
} );

describe( 'handleRequestResetOptions()', () => {
	const userData = {
		user: 'foo',
	};

	describe( 'success', () => {
		test( 'should dispatch RECEIVE action on success', done => {
			const dispatch = sinon.spy( action => {
				if ( action.type === ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE ) {
					expect(
						dispatch.calledWith( {
							type: ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
							items: fromApi( validResponse ),
						} )
					).toBe( true );

					done();
				}
			} );

			requestResetOptionsSuccess( { dispatch }, { userData }, validResponse );
		} );

		test( 'should dispatch UPDATE_USER_DATA action on success', done => {
			const dispatch = sinon.spy( action => {
				if ( action.type === ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA ) {
					expect(
						dispatch.calledWith( {
							type: ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
							userData,
						} )
					).toBe( true );

					done();
				}
			} );

			requestResetOptionsSuccess( { dispatch }, { userData }, validResponse );
		} );
	} );

	describe( 'failure', () => {
		const errorResponse = {
			status: 400,
			message: 'Something wrong!',
		};

		test( 'should dispatch ERROR action on failure', done => {
			const dispatch = sinon.spy( () => {
				expect(
					dispatch.calledWithMatch( {
						type: ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
						error: errorResponse,
					} )
				).toBe( true );

				done();
			} );

			requestResetOptionsError( { dispatch }, { userData }, errorResponse );
		} );

		test( 'should dispatch ERROR action on validation failure', done => {
			const invalidResponse = {
				primary_email: 'foo@example.com',
			};

			const dispatch = sinon.spy( () => {
				expect(
					dispatch.calledWithMatch( {
						type: ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
						error: { message: 'Unexpected response format from /account-recovery/lookup' },
					} )
				).toBe( true );

				done();
			} );

			requestResetOptionsSuccess( { dispatch }, { userData }, invalidResponse );
		} );
	} );
} );
