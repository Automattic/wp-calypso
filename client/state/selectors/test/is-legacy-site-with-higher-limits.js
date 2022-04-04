import isLegacySiteWithHigherLimits from 'calypso/state/selectors/is-legacy-site-with-higher-limits';

describe( 'isLegacySiteWithHigherLimits()', () => {
	test( 'should return false for simple sites without a created_at option', () => {
		const state = { sites: { items: { 99: { options: {} } } } };

		expect( isLegacySiteWithHigherLimits( state, 99 ) ).toBe( false );
	} );

	test( 'should return false for unresolved sites', () => {
		expect( isLegacySiteWithHigherLimits( { sites: [] }, 99 ) ).toBe( false );
	} );

	test( 'should return true for a site created before 2022-04-01', () => {
		const state = {
			sites: {
				items: {
					99: {
						options: {
							created_at: '2022-03-31 23:59:59',
						},
					},
				},
			},
		};

		expect( isLegacySiteWithHigherLimits( state, 99 ) ).toBe( true );
	} );

	test( 'should return false for a site created on 2022-04-01', () => {
		const state = {
			sites: {
				items: {
					99: {
						options: {
							created_at: '2022-04-01 00:00:00',
						},
					},
				},
			},
		};

		expect( isLegacySiteWithHigherLimits( state, 99 ) ).toBe( false );
	} );

	test( 'should return false for a site created later on 2022-04-01', () => {
		const state = {
			sites: {
				items: {
					99: {
						options: {
							created_at: '2022-04-01 00:00:01',
						},
					},
				},
			},
		};

		expect( isLegacySiteWithHigherLimits( state, 99 ) ).toBe( false );
	} );

	test( 'should return true for an Atomic site created before 2022-04-01', () => {
		const state = {
			sites: {
				items: {
					99: {
						options: {
							is_automated_transfer: '1',
							created_at: '2022-03-31 23:59:59',
						},
					},
				},
			},
		};

		expect( isLegacySiteWithHigherLimits( state, 99 ) ).toBe( true );
	} );

	test( 'should return true for an Atomic Jetpack site created before 2022-04-01', () => {
		const state = {
			sites: {
				items: {
					99: {
						jetpack: true,
						options: {
							is_automated_transfer: '1',
							created_at: '2022-03-31 23:59:59',
						},
					},
				},
			},
		};

		expect( isLegacySiteWithHigherLimits( state, 99 ) ).toBe( true );
	} );

	test( 'should return false for a non-Atomic Jetpack site even if it was created before 2022-04-01', () => {
		const state = {
			sites: {
				items: {
					99: {
						jetpack: true,
						options: {
							created_at: '2022-03-31 23:59:59',
						},
					},
				},
			},
		};

		expect( isLegacySiteWithHigherLimits( state, 99 ) ).toBe( false );
	} );
} );
