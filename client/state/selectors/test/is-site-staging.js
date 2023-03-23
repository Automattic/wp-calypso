import isSiteStaging from 'calypso/state/selectors/is-site-staging';

describe( 'isSiteStaging()', () => {
	test( 'should return false if siteID is null', () => {
		const state = {};
		const siteId = null;

		expect( isSiteStaging( state, siteId ) ).toBe( false );
	} );

	test( 'should return false if site is not a staging site', () => {
		const state = {
			sites: {
				items: {
					12345: {
						is_wpcom_staging_site: false,
					},
				},
			},
		};
		const siteId = 12345;

		expect( isSiteStaging( state, siteId ) ).toBe( false );
	} );

	test( 'should return true if site is a staging site', () => {
		const state = {
			sites: {
				items: {
					12345: {
						is_wpcom_staging_site: true,
					},
				},
			},
		};
		const siteId = 12345;

		expect( isSiteStaging( state, siteId ) ).toBe( true );
	} );
} );
