import hasSiteProductJetpackStats from 'state/sites/selectors/has-site-product-jetpack-stats';

const stateWithFreeStats = {
	sites: {
		2916288: {
			plan: {},
			products: [
				{
					product_slug: 'jetpack_stats_free_yearly',
				},
			],
		},
	},
};

describe( 'hasSiteProductJetpackStats()', () => {
	test( 'should return false if site has only free products and set to onlyPaid', () => {
		const hasPaidJetpackStats = hasSiteProductJetpackStats( stateWithFreeStats, true, 2916288 );

		expect( hasPaidJetpackStats ).toEqual( false );
	} );

	test( 'should return true if site has free products and set not onlyPaid', () => {
		const hasJetpackStats = hasSiteProductJetpackStats( stateWithFreeStats, false, 2916288 );

		expect( hasJetpackStats ).toEqual( false );
	} );

	test( 'should return true if site has paid products and set to onlyPaid', () => {
		const stateWithPaidStats = {
			sites: {
				2916288: {
					plan: {},
					products: [
						{
							product_slug: 'jetpack_stats_monthly',
						},
					],
				},
			},
		};
		const hasPaidJetpackStats = hasSiteProductJetpackStats( stateWithPaidStats, true, 2916288 );

		expect( hasPaidJetpackStats ).toEqual( true );
	} );

	test( 'should return false if site has paid products but expired', () => {
		const stateWithExpiredStats = {
			sites: {
				2916288: {
					plan: {},
					products: [
						{
							product_slug: 'jetpack_stats_monthly',
							expired: true,
						},
					],
				},
			},
		};
		const hasJetpackStats = hasSiteProductJetpackStats( stateWithExpiredStats, false, 2916288 );

		expect( hasJetpackStats ).toEqual( false );
	} );
} );
