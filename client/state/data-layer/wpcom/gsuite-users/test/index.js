import {
	GSUITE_USERS_REQUEST,
	GSUITE_USERS_REQUEST_SUCCESS,
	GSUITE_USERS_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { getGSuiteUsers, getGSuiteUsersFailure, getGSuiteUsersSuccess } from '../';
import { isErrorNotice } from '../test-utils';

describe( 'wpcom-api', () => {
	describe( 'g suite users get users request', () => {
		const siteId = 1;
		const action = {
			type: GSUITE_USERS_REQUEST,
			siteId,
		};

		describe( '#getGSuiteUsers', () => {
			test( 'should dispatch an HTTP request to the get google-apps endpoint', () => {
				expect( getGSuiteUsers( action ) ).toEqual(
					http(
						{
							method: 'GET',
							path: '/sites/1/google-apps',
						},
						action
					)
				);
			} );
		} );

		describe( '#getGSuiteUsersFailure', () => {
			const message = 'An error has occured';

			test( 'should dispatch a get g suite users failure action on error', () => {
				const resultActions = getGSuiteUsersFailure( action, { message } );
				expect( resultActions ).toHaveLength( 2 );
				expect( isErrorNotice( resultActions[ 0 ] ) ).toBe( true );
				expect( resultActions[ 1 ] ).toEqual( {
					type: GSUITE_USERS_REQUEST_FAILURE,
					siteId,
					error: { message },
				} );
			} );
		} );

		describe( '#getGSuiteUsersSuccess', () => {
			test( 'should dispatch a get g suite users success action and response', () => {
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
				expect( getGSuiteUsersSuccess( action, response ) ).toEqual( {
					type: GSUITE_USERS_REQUEST_SUCCESS,
					siteId,
					response,
				} );
			} );

			test( 'should dispatch a get gsuite users failure action on no response', () => {
				const resultActions = getGSuiteUsersSuccess( action, undefined );
				expect( resultActions ).toHaveLength( 2 );
				expect( isErrorNotice( resultActions[ 0 ] ) ).toBe( true );
				expect( resultActions[ 1 ] ).toEqual( {
					type: GSUITE_USERS_REQUEST_FAILURE,
					siteId,
					error: { message: 'No response.' },
				} );
			} );
		} );
	} );
} );
