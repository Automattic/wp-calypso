/** @format */

/**
 * Internal dependencies
 */
import isGoogleMyBusinessLocationConnected from '../is-google-my-business-location-connected';

describe( 'isGoogleMyBusinessLocationConnected()', () => {
	test( 'should return false if location not connected', () => {
		const state = {
			siteKeyrings: {
				items: {
					1234: [],
				},
			},
		};

		expect( isGoogleMyBusinessLocationConnected( state, 1234 ) ).toBe( false );
	} );

	test( 'should return true if location is connected', () => {
		const state = {
			siteKeyrings: {
				items: {
					1234: [
						{
							keyring_site_id: '1234_65789',
							keyring_id: '1234',
							external_user_id: '65789',
							service: 'google_my_business',
						},
					],
				},
			},
		};

		expect( isGoogleMyBusinessLocationConnected( state, 1234 ) ).toBe( true );
	} );
} );
