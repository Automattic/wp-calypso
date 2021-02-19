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
} from 'calypso/state/action-types';

import { http } from 'calypso/state/data-layer/wpcom-http/actions';

const isErrorNotice = ( action ) => {
	return action && action.notice && 'is-error' === action.notice.status;
};

describe( 'wpcom-api', () => {
	describe( 'email accounts request', () => {
		const siteId = 1;
		const action = {
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
			const message = 'An error has occurred';

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
							domain_name: 'test.blog',
							product_name: 'G Suite Basic',
							product_slug: 'gapps',
							product_type: 'gapps',
							site_id: 1,
							mailboxes: [
								{
									name: 'user',
									first_name: 'User',
									last_name: 'One',
									state: 'suspended',
								},
							],
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
					error: { message: 'Failed to retrieve your email accounts. No response was received' },
				} );
			} );
		} );
	} );
} );
