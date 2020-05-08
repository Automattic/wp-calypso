/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getEmailAccounts, getEmailAccountsFailure, getEmailAccountsSuccess } from '../';
import {
	EMAIL_ACCOUNTS_REQUEST,
	EMAIL_ACCOUNTS_REQUEST_SUCCESS,
	EMAIL_ACCOUNTS_REQUEST_FAILURE,
} from 'state/action-types';
import { isErrorNotice } from '../test-utils';

import { http } from 'state/data-layer/wpcom-http/actions';

describe( 'wpcom-api', () => {
	describe( 'email accounts get users request', () => {
		const siteId = 1,
			action = {
				type: EMAIL_ACCOUNTS_REQUEST,
				siteId,
			};

		describe( '#getEmailAccounts', () => {
			test( 'should dispatch an HTTP request to the get email-accounts endpoint', () => {
				expect( getEmailAccounts( action ) ).to.eql(
					http(
						{
							method: 'GET',
							path: '/sites/1/email-accounts',
						},
						action
					)
				);
			} );
		} );

		describe( '#getEmailAccountsFailure', () => {
			const message = 'An error has occured';

			test( 'should dispatch a get email accounts failure action on error', () => {
				const resultActions = getEmailAccountsFailure( action, { message } );
				expect( resultActions ).to.have.lengthOf( 2 );
				expect( isErrorNotice( resultActions[ 0 ] ) ).to.be.true;
				expect( resultActions[ 1 ] ).to.eql( {
					type: EMAIL_ACCOUNTS_REQUEST_FAILURE,
					siteId,
					error: { message },
				} );
			} );
		} );

		describe( '#getEmailAccountsSuccess', () => {
			test( 'should dispatch a get email accounts success action and response', () => {
				const response = {
					accounts: [
						{
							email: 'test@example.blog',
							mailbox: 'test',
							domain: 'example.com',
							siteId: 1,
						},
					],
				};
				expect( getEmailAccountsSuccess( action, response ) ).to.eql( {
					type: EMAIL_ACCOUNTS_REQUEST_SUCCESS,
					siteId,
					response,
				} );
			} );

			test( 'should dispatch a get email accounts failure action on no response', () => {
				const resultActions = getEmailAccountsSuccess( action, undefined );
				expect( resultActions ).to.have.lengthOf( 2 );
				expect( isErrorNotice( resultActions[ 0 ] ) ).to.be.true;
				expect( resultActions[ 1 ] ).to.eql( {
					type: EMAIL_ACCOUNTS_REQUEST_FAILURE,
					siteId,
					error: { message: 'No response.' },
				} );
			} );
		} );
	} );
} );
