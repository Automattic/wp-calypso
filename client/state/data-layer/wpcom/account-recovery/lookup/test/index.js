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
	requestResetOptions,
} from '../';

import {
	ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
	ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
} from 'state/action-types';

describe( '#requestResetOptions', () => {
	let dispatch;

	useSandbox( sandbox => ( dispatch = sandbox.spy() ) );

	const apiBaseUrl = 'https://public-api.wordpress.com:443';
	const endpoint = '/wpcom/v2/account-recovery/lookup';
	const response = {
		primary_email: 'a****@example.com',
		secondary_email: 'b*****@example.com',
		primary_sms: '+1******456',
		secondary_sms: '+8*******456',
	};
	const userData = {
		user: 'foo',
	};

	describe( 'success', () => {
		useNock( nock => (
			nock( apiBaseUrl )
				.get( endpoint )
				.reply( 200, response )
		) );

		it( 'should dispatch RECEIVE action on success', () => {
			return requestResetOptions( { dispatch }, { userData } )
				.then( () =>
					assert.isTrue( dispatch.calledWith( {
						type: ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
						options: response,
					} ) )
				);
		} );
	} );

	const errorResponse = {
		status: 400,
		message: 'Something wrong!',
	};

	describe( 'failure', () => {
		useNock( nock => (
			nock( apiBaseUrl )
				.get( endpoint )
				.reply( errorResponse.status, errorResponse )
		) );

		it( 'should dispatch ERROR action on failure', () => {
			return requestResetOptions( { dispatch }, { userData } )
				.then( () =>
					assert.isTrue( dispatch.calledWithMatch( {
						type: ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
						error: errorResponse,
					} ) )
				);
		} );
	} );
} );
