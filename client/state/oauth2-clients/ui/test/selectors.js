import { isAndroidOAuth2Client, isIosOAuth2Client } from 'calypso/lib/oauth2-clients';
import { initialClientsData } from 'calypso/state/oauth2-clients/reducer';
import { getCurrentOAuth2Client, showOAuth2Layout } from '../selectors';

describe( 'selectors', () => {
	describe( 'getCurrentOAuth2Client()', () => {
		test( 'should return null if there is no information yet', () => {
			const clientData = getCurrentOAuth2Client( {} );

			expect( clientData ).toBeNull();
		} );

		test( 'should return the oauth2 client information if there is one', () => {
			const clientData = getCurrentOAuth2Client( {
				oauth2Clients: {
					clients: {
						1: {
							id: 1,
							name: 'test',
							title: 'WordPress.com Test Client',
							url: 'https://wordpres.com/calypso/images/wordpress/logo-stars.svg',
						},
					},
					ui: {
						currentClientId: 1,
					},
				},
			} );

			expect( clientData ).toEqual( {
				id: 1,
				name: 'test',
				title: 'WordPress.com Test Client',
				url: 'https://wordpres.com/calypso/images/wordpress/logo-stars.svg',
			} );
		} );

		// These tests verify the second half of the mobile app detection chain:
		// 1. The UI reducer sets currentClientId from the URL query param (see ui/test/reducer.js)
		// 2. getCurrentOAuth2Client resolves it to client data from initialClientsData (tested below)
		test( 'should return the iOS mobile app client when client_id is 11', () => {
			const clientData = getCurrentOAuth2Client( {
				oauth2Clients: {
					clients: initialClientsData,
					ui: {
						currentClientId: 11,
					},
				},
			} );

			expect( clientData ).toEqual( initialClientsData[ 11 ] );
			expect( isIosOAuth2Client( clientData ) ).toBe( true );
			expect( isAndroidOAuth2Client( clientData ) ).toBe( false );
		} );

		test( 'should return the Android mobile app client when client_id is 2697', () => {
			const clientData = getCurrentOAuth2Client( {
				oauth2Clients: {
					clients: initialClientsData,
					ui: {
						currentClientId: 2697,
					},
				},
			} );

			expect( clientData ).toEqual( initialClientsData[ 2697 ] );
			expect( isAndroidOAuth2Client( clientData ) ).toBe( true );
			expect( isIosOAuth2Client( clientData ) ).toBe( false );
		} );
	} );

	describe( 'showOAuth2Layout()', () => {
		test( 'should return false if there is no information yet', () => {
			const showOAuth2 = showOAuth2Layout( {} );

			expect( showOAuth2 ).toBe( false );
		} );

		test( 'should return false if there is no current oauth2 client set', () => {
			const showOAuth2 = showOAuth2Layout( {
				oauth2Clients: {
					clients: {
						1: {
							id: 1,
							name: 'test',
							title: 'WordPress.com Test Client',
							url: 'https://wordpres.com/calypso/images/wordpress/logo-stars.svg',
						},
					},
					ui: {
						currentClientId: undefined,
					},
				},
			} );

			expect( showOAuth2 ).toBe( false );
		} );

		test( 'should return true if there is a current client id set', () => {
			const showOAuth2 = showOAuth2Layout( {
				oauth2Clients: {
					clients: {
						1: {
							id: 1,
							name: 'test',
							title: 'WordPress.com Test Client',
							url: 'https://wordpres.com/calypso/images/wordpress/logo-stars.svg',
						},
					},
					ui: {
						currentClientId: 42,
					},
				},
			} );

			expect( showOAuth2 ).toBe( true );
		} );
	} );
} );
