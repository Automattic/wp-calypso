import isWooPaymentsFlow from 'calypso/state/selectors/is-woopayments-flow';

describe( 'isWooPaymentsOnboardingFlow', () => {
	test( 'should return false when no argument', () => {
		expect( isWooPaymentsFlow() ).toBe( false );
	} );

	test( 'should return false if no query present', () => {
		const state = {
			route: {
				query: {
					current: {
						email_address: 'user@wordpress.com',
					},
				},
			},
		};
		expect( isWooPaymentsFlow( state ) ).toBe( false );
	} );
	test( 'should return false when from query parameter is present in current query but is not woocommerce-payments', () => {
		const state = {
			route: {
				query: {
					current: {
						from: 'meh',
					},
				},
			},
		};
		expect( isWooPaymentsFlow( state ) ).toBe( false );
	} );
	test( 'should return false when from query parameter is present in initial query but is not woocommerce-payments', () => {
		const state = {
			route: {
				query: {
					initial: {
						from: 'meh',
					},
				},
			},
		};
		expect( isWooPaymentsFlow( state ) ).toBe( false );
	} );
	test( 'should return true when from query parameter is present in current query and is woocommerce-payments', () => {
		const state = {
			route: {
				query: {
					current: {
						from: 'woocommerce-payments',
					},
				},
			},
		};
		expect( isWooPaymentsFlow( state ) ).toBe( true );
	} );
	test( 'should return true when from query parameter is present in initial query and is woocommerce-payments', () => {
		const state = {
			route: {
				query: {
					initial: {
						from: 'woocommerce-payments',
					},
				},
			},
		};
		expect( isWooPaymentsFlow( state ) ).toBe( true );
	} );
} );
