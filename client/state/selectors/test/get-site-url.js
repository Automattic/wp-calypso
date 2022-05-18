import getSiteUrl from 'calypso/state/selectors/get-site-url';

describe( 'getSiteUrl()', () => {
	test( 'should return null if the site is unknown', () => {
		const state = {
			sites: {
				items: {
					456: { URL: 'https://wordpress.com' },
				},
			},
		};

		expect( getSiteUrl( state ) ).toBeNull();
		expect( getSiteUrl( state, 123 ) ).toBeNull();
	} );

	test( 'should return null if the Url is unknown', () => {
		const state = {
			sites: {
				items: {
					123: {},
					456: { URL: 'https://wordpress.com' },
				},
			},
		};
		expect( getSiteUrl( state, 123 ) ).toBeNull();
	} );

	test( 'should return the Url for a site', () => {
		const URL = 'https://wordpress.com';
		const result = getSiteUrl(
			{
				sites: {
					items: {
						123: {
							URL,
						},
					},
				},
			},
			123
		);

		expect( result ).toEqual( URL );
	} );
} );
