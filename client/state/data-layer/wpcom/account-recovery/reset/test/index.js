/**
 * External dependencies
 */
import { assert } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */

import { handleResetPasswordRequest } from '../';
import useNock from 'test/helpers/use-nock';

import {
	ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_SUCCESS,
	ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_ERROR,
} from 'state/action-types';

describe( 'handleResetPasswordRequest()', () => {
	const dispatch = sinon.spy();

	const apiBaseUrl = 'https://public-api.wordpress.com:443';
	const endpoint = '/wpcom/v2/account-recovery/reset';

	const params = {
		userData: {
			user: 'foo',
		},
		method: 'primary_email',
		key: 'a-super-secret-key',
		password: 'my-new-password-which-I-cannot-remember',
	};

	describe( 'success', () => {
		useNock( nock => (
			nock( apiBaseUrl )
				.post( endpoint )
				.reply( 200, { success: true } )
		) );

		it( 'should dispatch SUCCESS action on success', () => {
			return handleResetPasswordRequest( { dispatch }, params ).then( () =>
				assert.isTrue( dispatch.calledWith( {
					type: ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_SUCCESS,
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
			return handleResetPasswordRequest( { dispatch }, params ).then( () =>
				assert.isTrue( dispatch.calledWithMatch( {
					type: ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_ERROR,
					error: errorResponse,
				} ) )
			);
		} );
	} );
} );

