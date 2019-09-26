/**
 * Internal dependencies
 */
import getRawSite from '../get-raw-site';

describe( '#getRawSite()', () => {
	test( 'it should return null if there is no such site', () => {
		const rawSite = getRawSite(
			{
				sites: {
					items: {},
				},
			},
			77203199
		);

		expect( rawSite ).toBeNull();
	} );

	test( 'it should return the raw site object for site with that ID', () => {
		const site = {
			ID: 77203199,
			URL: 'https://example.com',
		};
		const rawSite = getRawSite(
			{
				sites: {
					items: {
						77203199: site,
					},
				},
			},
			77203199
		);

		expect( rawSite ).toEqual( site );
	} );
} );
