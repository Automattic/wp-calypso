import getDomainFromHomeUpsellInQuery from 'calypso/state/selectors/get-domain-from-home-upsell-in-query';

describe( '#getDomainFromHomeUpsellInQuery', () => {
	test( 'should return null when no argument', () => {
		expect( getDomainFromHomeUpsellInQuery() ).toBeNull();
	} );

	test( 'should return null if no get_domain query present', () => {
		const state = {
			route: {
				query: {
					current: {
						foo: 'bar',
					},
				},
			},
		};
		expect( getDomainFromHomeUpsellInQuery( state ) ).toBeNull();
	} );

	test( 'should return null when get_domain present but empty', () => {
		const state = {
			route: {
				query: {
					current: {
						get_domain: '',
					},
				},
			},
		};

		expect( getDomainFromHomeUpsellInQuery( state ) ).toBeNull();
	} );

	test( 'should return domain as string when get_domain query present', () => {
		const state = {
			route: {
				query: {
					current: {
						get_domain: 'foo.com',
					},
				},
			},
		};

		// toBe is a strict equality check here.
		expect( getDomainFromHomeUpsellInQuery( state ) ).toBe( 'foo.com' );
	} );

	test( 'should return domain as string when CSV get_domain query present', () => {
		const state = {
			route: {
				query: {
					current: {
						get_domain: 'foo.com, bar.com',
					},
				},
			},
		};

		// toBe is a strict equality check here.
		expect( getDomainFromHomeUpsellInQuery( state ) ).toBe( 'foo.com, bar.com' );
	} );
} );
