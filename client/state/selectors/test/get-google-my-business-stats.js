import getGoogleMyBusinessStats from 'calypso/state/selectors/get-google-my-business-stats';

describe( 'getGoogleMyBusinessStats', () => {
	test( 'should return null if data not available', () => {
		expect( getGoogleMyBusinessStats( {}, 123, 'actions', 'month' ) ).toBeNull();
	} );

	test( 'should return stats data', () => {
		const state = {
			googleMyBusiness: {
				123: {
					location: {
						id: null,
					},
					stats: {
						actions: {
							month: {
								total: {
									interval: 'month',
									statType: 'actions',
									aggregation: 'total',
									data: { hello: 'world' },
								},
							},
						},
					},
				},
			},
		};

		expect( getGoogleMyBusinessStats( state, 123, 'actions', 'month', 'total' ) ).toEqual( {
			interval: 'month',
			statType: 'actions',
			aggregation: 'total',
			data: { hello: 'world' },
		} );
	} );
} );
