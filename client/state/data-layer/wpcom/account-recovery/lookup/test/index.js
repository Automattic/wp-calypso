/**
 * External dependencies
 */
import { assert } from 'chai';
import sinon from 'sinon';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import useNock from 'test/helpers/use-nock';

import {
	fromApi,
	validate,
	handleRequestResetOptions,
} from '../';

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
	it( 'should validate successfully and throw nothing.', () => {
		assert.doesNotThrow( () => validate( validResponse ) );
	} );

	it( 'should invalidate missing keys and throw an error.', () => {
		assert.throws( () => validate( {
			primary_email: 'foo@example.com',
		} ), Error );
	} );

	it( 'should invalidate unexpected value type and throw an error', () => {
		assert.throws( () => validate( {
			primary_email: 'foo@example.com',
			primary_sms: '123456',
			secondary_email: 'bar@example.com',
			secondary_sms: 123456,
		} ), Error );
	} );
} );

describe( 'handleRequestResetOptions()', () => {
	const apiBaseUrl = 'https://public-api.wordpress.com:443';
	const endpoint = '/wpcom/v2/account-recovery/lookup';

	const userData = {
		user: 'foo',
	};

	describe( 'success', () => {
		useNock( nock => (
			nock( apiBaseUrl )
				.persist()
				.get( endpoint )
				.reply( 200, validResponse )
		) );

		it( 'should dispatch RECEIVE action on success', ( done ) => {
			const dispatch = sinon.spy( ( action ) => {
				if ( action.type === ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE ) {
					assert.isTrue( dispatch.calledWith( {
						type: ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
						items: fromApi( validResponse ),
					} ) );

					done();
				}
			} );

			handleRequestResetOptions( { dispatch }, { userData }, noop );
		} );

		it( 'should dispatch UPDATE_USER_DATA action on success', ( done ) => {
			const dispatch = sinon.spy( ( action ) => {
				if ( action.type === ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA ) {
					assert.isTrue( dispatch.calledWith( {
						type: ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
						userData,
					} ) );

					done();
				}
			} );

			handleRequestResetOptions( { dispatch }, { userData }, noop );
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

		it( 'should dispatch ERROR action on failure', ( done ) => {
			const dispatch = sinon.spy( () => {
				assert.isTrue( dispatch.calledWithMatch( {
					type: ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
					error: errorResponse,
				} ) );

				done();
			} );

			handleRequestResetOptions( { dispatch }, { userData }, noop );
		} );
	} );
} );
