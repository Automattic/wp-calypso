import isWooDnaFlow from 'calypso/state/selectors/is-woo-dna-flow';

describe( 'isWooDnaFlow', () => {
	test( 'should return false if no state', () => {
		expect( isWooDnaFlow() ).toBe( false );
	} );

	test( 'should return false if no woodna_service_name present', () => {
		const state = {
			route: {
				query: {
					current: {
						from: 'test',
					},
				},
			},
		};
		expect( isWooDnaFlow( state ) ).toBe( false );
	} );

	test( 'should return true when current woodna_service_name parameter is present', () => {
		const state = {
			route: {
				query: {
					current: {
						woodna_service_name: 'WooCommerce Shipping',
					},
				},
			},
		};
		expect( isWooDnaFlow( state ) ).toBe( true );
	} );
	test( 'should return true when initial woodna_service_name parameter is present', () => {
		const state = {
			route: {
				query: {
					initial: {
						woodna_service_name: 'meh',
					},
				},
			},
		};
		expect( isWooDnaFlow( state ) ).toBe( true );
	} );
	test( 'should return true when woodna_service_name parameter is present in initial query but not current query', () => {
		const state = {
			route: {
				query: {
					initial: {
						woodna_service_name: 'test',
					},
					current: {
						from: 'foo',
					},
				},
			},
		};
		expect( isWooDnaFlow( state ) ).toBe( true );
	} );
	test( 'should return true when from woodna_service_name parameter is present in current query but not initial query', () => {
		const state = {
			route: {
				query: {
					initial: {
						from: 'foo',
					},
					current: {
						woodna_service_name: 'test',
					},
				},
			},
		};
		expect( isWooDnaFlow( state ) ).toBe( true );
	} );

	test( 'should return true when woodna_service_name parameter is present in redirect_to URL', () => {
		const state = {
			route: {
				query: {
					current: {
						from: 'woocommerce-shipping',
					},
				},
			},
			login: {
				redirectTo: {
					original:
						'/jetpack/connect/authorize?client_id=123&woodna_service_name=WooCommerce+Shipping&from=woocommerce-shipping',
				},
			},
		};
		expect( isWooDnaFlow( state ) ).toBe( true );
	} );

	test( 'should return false when no woodna_service_name parameter is present anywhere', () => {
		const state = {
			route: {
				query: {
					current: {
						from: 'woocommerce-shipping',
					},
				},
			},
			login: {
				redirectTo: {
					original: '/jetpack/connect/authorize?client_id=123&from=woocommerce-shipping',
				},
			},
		};
		expect( isWooDnaFlow( state ) ).toBe( false );
	} );
} );
