/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getTitanUsers, getTitanUsersFailure, getTitanUsersSuccess } from '../';
import {
	TITAN_USERS_REQUEST,
	TITAN_USERS_REQUEST_SUCCESS,
	TITAN_USERS_REQUEST_FAILURE,
} from 'state/action-types';
import { isErrorNotice } from '../test-utils';

import { http } from 'state/data-layer/wpcom-http/actions';

describe( 'wpcom-api', () => {
	describe( 'titan users get users request', () => {
		const siteId = 1,
			action = {
				type: TITAN_USERS_REQUEST,
				siteId,
			};

		describe( '#getTitanUsers', () => {
			test( 'should dispatch an HTTP request to the get titan endpoint', () => {
				expect( getTitanUsers( action ) ).to.eql(
					http(
						{
							method: 'GET',
							path: '/sites/1/titan',
						},
						action
					)
				);
			} );
		} );

		describe( '#getTitanUsersFailure', () => {
			const message = 'An error has occured';

			test( 'should dispatch a get titan users failure action on error', () => {
				const resultActions = getTitanUsersFailure( action, { message } );
				expect( resultActions ).to.have.lengthOf( 2 );
				expect( isErrorNotice( resultActions[ 0 ] ) ).to.be.true;
				expect( resultActions[ 1 ] ).to.eql( {
					type: TITAN_USERS_REQUEST_FAILURE,
					siteId,
					error: { message },
				} );
			} );
		} );

		describe( '#getTitanUsersSuccess', () => {
			test( 'should dispatch a get titan users success action and response', () => {
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
				expect( getTitanUsersSuccess( action, response ) ).to.eql( {
					type: TITAN_USERS_REQUEST_SUCCESS,
					siteId,
					response,
				} );
			} );

			test( 'should dispatch a get titan users failure action on no response', () => {
				const resultActions = getTitanUsersSuccess( action, undefined );
				expect( resultActions ).to.have.lengthOf( 2 );
				expect( isErrorNotice( resultActions[ 0 ] ) ).to.be.true;
				expect( resultActions[ 1 ] ).to.eql( {
					type: TITAN_USERS_REQUEST_FAILURE,
					siteId,
					error: { message: 'No response.' },
				} );
			} );
		} );
	} );
} );
