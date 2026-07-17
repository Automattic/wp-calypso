import {
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_GROWTH_YEARLY,
	PLAN_JETPACK_BUSINESS,
} from '@automattic/calypso-products';
import { getBundledPlanSlug } from '../stats-purchase-single-item';

describe( 'getBundledPlanSlug', () => {
	it( 'returns undefined when no bundled plan is owned', () => {
		expect(
			getBundledPlanSlug( {
				isCompletePlanOwned: false,
				isGrowthPlanOwned: false,
				isBusinessPlanOwned: false,
			} )
		).toBeUndefined();
	} );

	it( 'prefers Complete over Growth and Business', () => {
		expect(
			getBundledPlanSlug( {
				isCompletePlanOwned: true,
				isGrowthPlanOwned: true,
				isBusinessPlanOwned: true,
			} )
		).toBe( PLAN_JETPACK_COMPLETE );
	} );

	it( 'prefers Growth over Business when Complete is not owned', () => {
		expect(
			getBundledPlanSlug( {
				isCompletePlanOwned: false,
				isGrowthPlanOwned: true,
				isBusinessPlanOwned: true,
			} )
		).toBe( PLAN_JETPACK_GROWTH_YEARLY );
	} );

	it( 'falls back to Business when only Business is owned', () => {
		expect(
			getBundledPlanSlug( {
				isCompletePlanOwned: false,
				isGrowthPlanOwned: false,
				isBusinessPlanOwned: true,
			} )
		).toBe( PLAN_JETPACK_BUSINESS );
	} );
} );
