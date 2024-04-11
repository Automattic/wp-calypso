import { extendTiersBeyondHighestTier } from '../use-available-upgrade-tiers';
import originalTiers from './original-tiers-fixture.json';

const tiers = originalTiers;
const CURRENCY_CODE = 'USD';

describe( 'extendTiersBeyondHighestTier', () => {
	it( 'should return original tiers if not purchased or with little monthly views', () => {
		const usageData = { views_limit: null, billableMonthlyViews: 0 };
		const extendedTiers = extendTiersBeyondHighestTier( tiers, CURRENCY_CODE, usageData );

		expect( extendedTiers.length ).toBe( 6 );
		expect( extendedTiers[ 0 ] ).toEqual( tiers[ 0 ] );
		expect( extendedTiers[ 1 ] ).toEqual( tiers[ 1 ] );
	} );
} );
