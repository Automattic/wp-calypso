/**
 * External dependencies
 */
import { assert } from 'chai';
import sinon from 'sinon';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */

import { handleValidateRequest } from '../';
import useNock from 'test/helpers/use-nock';

import {
	ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST_SUCCESS,
	ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST_ERROR,
	ACCOUNT_RECOVERY_RESET_SET_VALIDATION_KEY,
} from 'state/action-types';

describe( 'handleValidateRequest()', () => {
	const apiBaseUrl = 'https://public-api.wordpress.com:443';
	const endpoint = '/wpcom/v2/account-recovery/validate';

	const userData = { user: 'foo' };
	const method = 'primary_email';
	const key = 'a-super-secret-key';

	describe( 'success', () => {
		useNock( nock => (
			nock( apiBaseUrl )
				.persist()
				.post( endpoint )
				.reply( 200, { success: true } )
		) );

		it( 'should dispatch SUCCESS action on success', ( done ) => {
			const dispatch = sinon.spy( ( action ) => {
				if ( action.type === ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST_SUCCESS ) {
					assert.isTrue( dispatch.calledWith( {
						type: ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST_SUCCESS,
					} ) );

					done();
				}
			} );

			handleValidateRequest( { dispatch }, { userData, method, key }, noop );
		} );

		it( 'should dispatch SET_VALIDATION_KEY action on success', ( done ) => {
			const dispatch = sinon.spy( ( action ) => {
				if ( action.type === ACCOUNT_RECOVERY_RESET_SET_VALIDATION_KEY ) {
					assert.isTrue( dispatch.calledWith( {
						type: ACCOUNT_RECOVERY_RESET_SET_VALIDATION_KEY,
						key: key,
					} ) );

					done();
				}
			} );

			handleValidateRequest( { dispatch }, { userData, method, key }, noop );
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

		it( 'should dispatch ERROR action on failure', ( done ) => {
			const dispatch = sinon.spy( () => {
				assert.isTrue( dispatch.calledWithMatch( {
					type: ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST_ERROR,
					error: errorResponse,
				} ) )

				done();
			} );

			handleValidateRequest( { dispatch }, { userData, method, key }, noop );
		} );
	} );
} );

