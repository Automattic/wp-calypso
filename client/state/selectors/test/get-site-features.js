import getFeaturesBySiteId from 'calypso/state/selectors/get-site-features';

describe( 'selectors', () => {
	describe( '#getFeaturesBySiteId()', () => {
		test( 'should return features by site id', () => {
			const active_a = [ 'feature_active_a_01', 'feature_active_a_02', 'feature_active_a_03' ];
			const available_a = {
				feature_available_01: [ 'plan_a-01_01', 'plan_a-01_02', 'plan_a-01_03' ],
				feature_available_02: [ 'plan_a-02_01', 'plan_a-02_02', 'plan_a-02_03' ],
				feature_available_03: [ 'plan_a-03_01', 'plan_a-03_02', 'plan_a-03_03' ],
			};

			const active_b = [ 'feature_active_b_01', 'feature_active_b_02', 'feature_active_b_03' ];
			const available_b = {
				feature_available_01: [ 'plan_b-01_01', 'plan_b-01_02', 'plan_b-01_03' ],
				feature_available_02: [ 'plan_b-02_01', 'plan_b-02_02', 'plan_b-02_03' ],
				feature_available_03: [ 'plan_b-03_01', 'plan_b-03_02', 'plan_b-03_03' ],
			};

			const features_a = {
				active: active_a,
				available: available_a,
			};

			const state = {
				sites: {
					features: {
						123001: {
							data: {
								active: active_a,
								available: available_a,
							},
						},

						123002: {
							data: {
								active: active_b,
								available: available_b,
							},
						},
					},
				},
			};

			const features = getFeaturesBySiteId( state, 123001 ); // site (A).
			expect( features ).toEqual( features_a );
		} );
	} );

	test( 'should return null when no site id', () => {
		const active_a = [ 'feature_active_a_01', 'feature_active_a_02', 'feature_active_a_03' ];
		const available_a = {
			feature_available_01: [ 'plan_a-01_01', 'plan_a-01_02', 'plan_a-01_03' ],
			feature_available_02: [ 'plan_a-02_01', 'plan_a-02_02', 'plan_a-02_03' ],
			feature_available_03: [ 'plan_a-03_01', 'plan_a-03_02', 'plan_a-03_03' ],
		};

		const active_b = [ 'feature_active_b_01', 'feature_active_b_02', 'feature_active_b_03' ];
		const available_b = {
			feature_available_01: [ 'plan_b-01_01', 'plan_b-01_02', 'plan_b-01_03' ],
			feature_available_02: [ 'plan_b-02_01', 'plan_b-02_02', 'plan_b-02_03' ],
			feature_available_03: [ 'plan_b-03_01', 'plan_b-03_02', 'plan_b-03_03' ],
		};

		const state = {
			sites: {
				features: {
					123001: {
						data: {
							active: active_a,
							available: available_a,
						},
					},

					123002: {
						data: {
							active: active_b,
							available: available_b,
						},
					},
				},
			},
		};

		const features = getFeaturesBySiteId( state ); // site (A).
		expect( features ).toBeNull();
	} );
} );
