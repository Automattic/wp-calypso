/** @format */

/**
 * External dependencies
 */
import { assert } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { fromApi, validate, requestResetOptionsSuccess, requestResetOptionsError } from '../';
import {
	ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
	ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
	ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
} from 'client/state/action-types';

const validResponse = {
	primary_email: 'a****@example.com',
	secondary_email: 'b*****@example.com',
	primary_sms: '+1******456',
	secondary_sms: '+8*******456',
};

describe( 'validate()', () => {
	test( 'should validate successfully and throw nothing.', () => {
		assert.doesNotThrow( () => validate( validResponse ) );
	} );

	test( 'should invalidate missing keys and throw an error.', () => {
		assert.throws(
			() =>
				validate( {
					primary_email: 'foo@example.com',
				} ),
			Error
		);
	} );

	test( 'should invalidate unexpected value type and throw an error', () => {
		assert.throws(
			() =>
				validate( {
					primary_email: 'foo@example.com',
					primary_sms: '123456',
					secondary_email: 'bar@example.com',
					secondary_sms: 123456,
				} ),
			Error
		);
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
					assert.isTrue(
						dispatch.calledWith( {
							type: ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
							items: fromApi( validResponse ),
						} )
					);

					done();
				}
			} );

			requestResetOptionsSuccess( { dispatch }, { userData }, validResponse );
		} );

		test( 'should dispatch UPDATE_USER_DATA action on success', done => {
			const dispatch = sinon.spy( action => {
				if ( action.type === ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA ) {
					assert.isTrue(
						dispatch.calledWith( {
							type: ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
							userData,
						} )
					);

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
				assert.isTrue(
					dispatch.calledWithMatch( {
						type: ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
						error: errorResponse,
					} )
				);

				done();
			} );

			requestResetOptionsError( { dispatch }, { userData }, errorResponse );
		} );

		test( 'should dispatch ERROR action on validation failure', done => {
			const invalidResponse = {
				primary_email: 'foo@example.com',
			};

			const dispatch = sinon.spy( () => {
				assert.isTrue(
					dispatch.calledWithMatch( {
						type: ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
						error: { message: 'Unexpected response format from /account-recovery/lookup' },
					} )
				);

				done();
			} );

			requestResetOptionsSuccess( { dispatch }, { userData }, invalidResponse );
		} );
	} );
} );
