import isWooCommerceCoreProfilerFlow from 'calypso/state/selectors/is-woocommerce-core-profiler-flow';

describe( 'isWooCommerceCoreProfilerFlow', () => {
	test( 'should return false when state is empty', () => {
		expect( isWooCommerceCoreProfilerFlow( {} ) ).toBe( false );
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
		expect( isWooCommerceCoreProfilerFlow( state ) ).toBe( false );
	} );
	test( 'should return false when from query parameter is present in current query but is not woocommerce-core-profiler', () => {
		const state = {
			route: {
				query: {
					current: {
						from: 'meh',
					},
				},
			},
		};
		expect( isWooCommerceCoreProfilerFlow( state ) ).toBe( false );
	} );
	test( 'should return false when from query parameter is present in initial query but is not woocommerce-core-profiler', () => {
		const state = {
			route: {
				query: {
					initial: {
						from: 'meh',
					},
				},
			},
		};
		expect( isWooCommerceCoreProfilerFlow( state ) ).toBe( false );
	} );
	test( 'should return true when from query parameter is present in current query and is woocommerce-core-profiler', () => {
		const state = {
			route: {
				query: {
					current: {
						from: 'woocommerce-core-profiler',
					},
				},
			},
		};
		expect( isWooCommerceCoreProfilerFlow( state ) ).toBe( true );
	} );
	test( 'should return true when from query parameter is present in initial query and is woocommerce-core-profiler', () => {
		const state = {
			route: {
				query: {
					initial: {
						from: 'woocommerce-core-profiler',
					},
				},
			},
		};
		expect( isWooCommerceCoreProfilerFlow( state ) ).toBe( true );
	} );
} );
