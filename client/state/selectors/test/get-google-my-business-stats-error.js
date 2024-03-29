import getGoogleMyBusinessStatsError from 'calypso/state/selectors/get-google-my-business-stats-error';

describe( 'getGoogleMyBusinessStatsError', () => {
	test( 'should return null if no error available', () => {
		expect( getGoogleMyBusinessStatsError( {}, 123, 'actions', 'month' ) ).toBeNull();
	} );

	test( 'should return stats error', () => {
		const state = {
			googleMyBusiness: {
				123: {
					location: {
						id: null,
					},
					statsError: {
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

		expect( getGoogleMyBusinessStatsError( state, 123, 'actions', 'month', 'total' ) ).toEqual( {
			interval: 'month',
			statType: 'actions',
			aggregation: 'total',
			data: { hello: 'world' },
		} );
	} );
} );
