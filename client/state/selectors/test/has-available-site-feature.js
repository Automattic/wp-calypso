import hasAvailableSiteFeature from 'calypso/state/selectors/has-available-site-feature';

describe( 'selectors', () => {
	describe( '#hasAvailableSiteFeature()', () => {
		test( 'should return False when no site id', () => {
			const available = {
				'feature-available-01': [ 'plan-01', 'plan-02', 'plan-03' ],
				'feature-available-02': [ 'plan-01' ],
				'feature-available-03': [ 'plan-02' ],
			};

			const state = {
				sites: {
					features: {
						123001: {
							data: {
								available,
							},
						},
					},
				},
			};

			const availableFeature = hasAvailableSiteFeature( state );
			expect( availableFeature ).toEqual( false );
		} );

		test( 'should return False when site does not exist', () => {
			const available = {
				'feature-available-01': [ 'plan-01', 'plan-02', 'plan-03' ],
				'feature-available-02': [ 'plan-01' ],
				'feature-available-03': [ 'plan-02' ],
			};

			const state = {
				sites: {
					features: {
						123001: {
							data: {
								available,
							},
						},
					},
				},
			};

			const availableFeature = hasAvailableSiteFeature( state, 'unknown' );
			expect( availableFeature ).toEqual( false );
		} );

		test( 'should return False when feature is not populated', () => {
			const state = {
				sites: {},
			};

			const availableFeature = hasAvailableSiteFeature( state, 123001 );
			expect( availableFeature ).toEqual( false );
		} );

		test( 'should return False when available feature is not populated', () => {
			const state = {
				sites: {
					features: {
						123001: {
							data: {},
						},
					},
				},
			};

			const availableFeature = hasAvailableSiteFeature( state, 123001 );
			expect( availableFeature ).toEqual( false );
		} );

		test( 'should return False when feature id is not defined', () => {
			const available = {
				'feature-available-01': [ 'plan-01', 'plan-02', 'plan-03' ],
				'feature-available-02': [ 'plan-01' ],
				'feature-available-03': [ 'plan-02' ],
			};

			const state = {
				sites: {
					features: {
						123001: {
							data: {
								available,
							},
						},
					},
				},
			};

			const availableFeature = hasAvailableSiteFeature( state, 123001 );
			expect( availableFeature ).toEqual( false );
		} );

		test( 'should return False when feature is not defined in the available object', () => {
			const available = {
				'feature-available-01': [ 'plan-01', 'plan-02', 'plan-03' ],
				'feature-available-02': [ 'plan-01' ],
				'feature-available-03': [ 'plan-02' ],
			};

			const state = {
				sites: {
					features: {
						123001: {
							data: {
								available,
							},
						},
					},
				},
			};

			const availableFeature = hasAvailableSiteFeature( state, 123001, 'not-available-feature' );
			expect( availableFeature ).toEqual( false );
		} );

		test( 'should return plans array when feature available', () => {
			const available = {
				'feature-available-01': [ 'plan-01', 'plan-02', 'plan-03' ],
				'feature-available-02': [ 'plan-01' ],
				'feature-available-03': [ 'plan-02' ],
			};

			const state = {
				sites: {
					features: {
						123001: {
							data: {
								available,
							},
						},
					},
				},
			};

			const availableFeature = hasAvailableSiteFeature( state, 123001, 'feature-available-01' );
			expect( availableFeature ).toEqual( [ 'plan-01', 'plan-02', 'plan-03' ] );
		} );
	} );
} );
