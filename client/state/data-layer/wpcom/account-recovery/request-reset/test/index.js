/**
 * External dependencies
 */
import { assert } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */

import { handleRequestReset } from '../';
import useNock from 'test/helpers/use-nock';

import {
	ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS,
	ACCOUNT_RECOVERY_RESET_REQUEST_ERROR,
} from 'state/action-types';

describe( 'handleRequestReset()', () => {
	const dispatch = sinon.spy();

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
			return handleRequestReset( { dispatch }, { request } ).then( () =>
				assert.isTrue( dispatch.calledWith( {
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
			return handleRequestReset( { dispatch }, { request } ).then( () =>
				assert.isTrue( dispatch.calledWithMatch( {
					type: ACCOUNT_RECOVERY_RESET_REQUEST_ERROR,
					error: errorResponse,
				} ) )
			);
		} );
	} );
} );
