import isStagingSite from 'calypso/state/selectors/is-staging-site';

describe( 'isStagingSite()', () => {
	test( 'should return null if the specified site was not found in the state', () => {
		const state = {
			sites: {
				items: {},
			},
		};

		expect( isStagingSite( state, 12345 ) ).toBeNull();
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

		expect( isStagingSite( state, 12345 ) ).toBe( false );
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

		expect( isStagingSite( state, 12345 ) ).toBe( true );
	} );
} );
