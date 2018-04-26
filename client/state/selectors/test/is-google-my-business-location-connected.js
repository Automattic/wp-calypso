/** @format */

/**
 * Internal dependencies
 */
import isGoogleMyBusinessLocationConnected from '../is-google-my-business-location-connected';

jest.mock( 'state/sites/selectors', () => ( {
	getSitePlanSlug: jest.fn(),
} ) );

describe( 'isGoogleMyBusinessLocationConnected()', () => {
	test( 'should return false if location not connected', () => {
		const state = {
			siteSettings: {
				items: {
					1234: {
						google_my_business_keyring_id: null,
						google_my_business_location_id: '',
					},
				},
			},
		};

		expect( isGoogleMyBusinessLocationConnected( state, 1234 ) ).toBe( false );
	} );

	test( 'should return true if location is connected', () => {
		const state = {
			siteSettings: {
				items: {
					1234: {
						google_my_business_keyring_id: '234523',
						google_my_business_location_id: '2354235',
					},
				},
			},
		};

		expect( isGoogleMyBusinessLocationConnected( state, 1234 ) ).toBe( true );
	} );
} );
