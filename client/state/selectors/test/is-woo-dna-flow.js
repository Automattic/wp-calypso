import isWooDnaFlow from 'calypso/state/selectors/is-woo-dna-flow';

describe( 'isWooDnaFlow', () => {
	test( 'should return false when no argument', () => {
		expect( isWooDnaFlow() ).toBe( false );
	} );

	test( 'should return false if no woodna_service_name present', () => {
		const state = {
			route: {
				query: {
					current: {
						email_address: 'user@wordpress.com',
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
						woodna_service_name: 'meh',
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
						woodna_service_name: 'meh',
					},
					current: {
						email_address: 'x@wordpress.com',
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
					current: {
						woodna_service_name: 'meh',
					},
					initial: {
						email_address: 'x@wordpress.com',
					},
				},
			},
		};
		expect( isWooDnaFlow( state ) ).toBe( true );
	} );
} );
