import hasDomainOnlySites from 'calypso/state/selectors/has-domain-only-sites';

const currentUser = { capabilities: {} };

describe( 'hasDomainOnlySites()', () => {
	test( 'returns false when user has no sites', () => {
		const state = { currentUser, sites: { items: {} } };
		expect( hasDomainOnlySites( state ) ).toBe( false );
	} );

	test( 'returns false when user has only regular sites', () => {
		const state = {
			currentUser,
			sites: {
				items: {
					1: { ID: 1, options: { is_domain_only: false } },
					2: { ID: 2, options: {} },
				},
			},
		};
		expect( hasDomainOnlySites( state ) ).toBe( false );
	} );

	test( 'returns true when user has at least one domain-only site', () => {
		const state = {
			currentUser,
			sites: {
				items: {
					1: { ID: 1, options: { is_domain_only: false } },
					2: { ID: 2, options: { is_domain_only: true } },
				},
			},
		};
		expect( hasDomainOnlySites( state ) ).toBe( true );
	} );

	test( 'returns true when user has only domain-only sites', () => {
		const state = {
			currentUser,
			sites: {
				items: {
					1: { ID: 1, options: { is_domain_only: true } },
				},
			},
		};
		expect( hasDomainOnlySites( state ) ).toBe( true );
	} );
} );
