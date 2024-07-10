import { getPlanBillPeriod } from '../';

describe( 'selectors', () => {
	describe( '#getPlanBillPeriod()', () => {
		const state = {
			plans: {
				items: [
					{
						product_id: 1008,
						product_slug: 'business-bundle',
						bill_period: 365,
					},
					{
						product_id: 1028,
						product_slug: 'business-bundle-2y',
						bill_period: 730,
					},
				],
			},
		};
		it( 'should return a plan bill period - annual trem', () => {
			const billPeriod = getPlanBillPeriod( state, 'business-bundle' );
			expect( billPeriod ).toEqual( 365 );
		} );
		it( 'should return a plan bill period - biennial trem', () => {
			const billPeriod = getPlanBillPeriod( state, 'business-bundle-2y' );
			expect( billPeriod ).toEqual( 730 );
		} );
	} );
} );
