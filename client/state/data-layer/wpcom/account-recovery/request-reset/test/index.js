/**
 * External dependencies
 */
import { assert } from 'chai';
import sinon from 'sinon';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */

import { handleRequestReset } from '../';
import useNock from 'test/helpers/use-nock';

import {
	ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS,
	ACCOUNT_RECOVERY_RESET_REQUEST_ERROR,
	ACCOUNT_RECOVERY_RESET_SET_METHOD,
} from 'state/action-types';

describe( 'handleRequestReset()', () => {
	const apiBaseUrl = 'https://public-api.wordpress.com:443';
	const endpoint = '/wpcom/v2/account-recovery/request-reset';

	const userData = { user: 'foo' };
	const method = 'primary-email';

	describe( 'success', () => {
		useNock( nock => (
			nock( apiBaseUrl )
				.persist()
				.post( endpoint )
				.reply( 200, { success: true } )
		) );

		it( 'should dispatch SUCCESS action on success', () => {
			const dispatch = sinon.spy( ( action ) => {
				if ( action.type === ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS ) {
					assert.isTrue( dispatch.calledWith( {
						type: ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS,
					} ) );
				}
			} );

			handleRequestReset( { dispatch }, { userData, method }, noop );
		} );

		it( 'should dispatch SET_METHOD action on success', () => {
			const dispatch = sinon.spy( ( action ) => {
				if ( action.type === ACCOUNT_RECOVERY_RESET_SET_METHOD ) {
					assert.isTrue( dispatch.calledWith( {
						type: ACCOUNT_RECOVERY_RESET_SET_METHOD,
						method,
					} ) );
				}
			} );

			handleRequestReset( { dispatch }, { userData, method }, noop );
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
			const dispatch = sinon.spy( () => {
				assert.isTrue( dispatch.calledWithMatch( {
					type: ACCOUNT_RECOVERY_RESET_REQUEST_ERROR,
					error: errorResponse,
				} ) )
			} );

			handleRequestReset( { dispatch }, { userData, method }, noop );
		} );
	} );
} );
