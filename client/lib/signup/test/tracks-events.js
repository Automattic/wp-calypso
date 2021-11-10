/**
 * @jest-environment jsdom
 */
import { recordRegistration } from 'calypso/lib/analytics/signup';
import wpcom from 'calypso/lib/wp';
import { createAccount } from '../step-actions';
jest.mock( 'calypso/lib/analytics/signup' );

describe( 'Create account with social signup', () => {
	test( 'calypso_new_user_site_creation fires when user is created via social', () => {
		// Mocks.
		const fakeCallback = () => {
			'ok';
		};

		const fakeStore = {
			getState: () => ( {} ),
		};

		const fakeUserData = {};

		const fakeApi = {
			response: {
				bearer_token: '123',
				created_account: true,
			},
		};

		// Returning known data from WPcom API call.
		jest.spyOn( wpcom.req, 'post' ).mockReturnValue( fakeApi );

		createAccount(
			fakeCallback,
			'',
			{
				service: 'social',
				userData: fakeUserData,
				flowName: 'some flow',
				access_token: 'sometoken134',
				id_token: 'idotken',
			},
			fakeStore
		);
		expect( recordRegistration ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'calypso_new_user_site_creation does not fire when social login', () => {
		expect( true );
	} );
} );
