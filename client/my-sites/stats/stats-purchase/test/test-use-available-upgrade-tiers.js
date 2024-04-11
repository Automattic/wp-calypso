import {
	extendTiersBeyondHighestTier,
	transformTiers,
	filterLowerTiers,
} from '../use-available-upgrade-tiers';
import originalTiers from './tiers-fixture';

const tiers = transformTiers( originalTiers );
const CURRENCY_CODE = 'USD';

describe( 'extendTiersBeyondHighestTier', () => {
	it( 'should return original tiers if not purchased or with little monthly views', () => {
		const usageData = { views_limit: null, billableMonthlyViews: 0 };
		const extendedTiers = extendTiersBeyondHighestTier( tiers, CURRENCY_CODE, usageData );

		expect( extendedTiers.length ).toBe( 6 );
		expect( extendedTiers[ 0 ] ).toEqual( tiers[ 0 ] );
		expect( extendedTiers[ 1 ] ).toEqual( tiers[ 1 ] );
	} );
	it( 'should return original tiers if purchased', () => {
		const usageData = { views_limit: 10000, billableMonthlyViews: 0 };
		const newTiers = filterLowerTiers( tiers, usageData );
		const extendedTiers = extendTiersBeyondHighestTier( newTiers, CURRENCY_CODE, usageData );

		expect( extendedTiers.length ).toBe( 6 );
		expect( extendedTiers[ 0 ].views ).toEqual( newTiers[ 0 ].views );
		expect( extendedTiers[ 5 ].views ).toEqual( 3e6 );
	} );
	it( 'should return original tiers with monthly views - 10k', () => {
		const usageData = { views_limit: null, billableMonthlyViews: 10000 };
		const newTiers = filterLowerTiers( tiers, usageData );
		const extendedTiers = extendTiersBeyondHighestTier( newTiers, CURRENCY_CODE, usageData );

		expect( extendedTiers.length ).toBe( 6 );
		expect( extendedTiers[ 0 ].views ).toEqual( newTiers[ 0 ].views );
		expect( extendedTiers[ 5 ].views ).toEqual( 3e6 );
	} );
	it( 'should return original tiers with monthly views - 1m', () => {
		const usageData = { views_limit: null, billableMonthlyViews: 1000000 };
		const newTiers = filterLowerTiers( tiers, usageData );
		const extendedTiers = extendTiersBeyondHighestTier( newTiers, CURRENCY_CODE, usageData );

		expect( extendedTiers.length ).toBe( 6 );
		expect( extendedTiers[ 0 ].views ).toEqual( newTiers[ 0 ].views );
		expect( extendedTiers[ 5 ].views ).toEqual( 7e6 );
	} );
	it( 'should return original tiers with monthly views - 3m', () => {
		const usageData = { views_limit: null, billableMonthlyViews: 3000000 };
		const newTiers = filterLowerTiers( tiers, usageData );
		const extendedTiers = extendTiersBeyondHighestTier( newTiers, CURRENCY_CODE, usageData );

		expect( extendedTiers.length ).toBe( 6 );
		expect( extendedTiers[ 0 ].views ).toEqual( newTiers[ 0 ].views );
		expect( extendedTiers[ 5 ].views ).toEqual( 8e6 ); // should be 9m??!!
	} );
	it( 'should return original tiers with monthly views, current tier whichever higher', () => {
		const usageData = { views_limit: 100000, billableMonthlyViews: 10000 };
		const newTiers = filterLowerTiers( tiers, usageData );
		const extendedTiers = extendTiersBeyondHighestTier( newTiers, CURRENCY_CODE, usageData );

		expect( extendedTiers.length ).toBe( 6 );
		expect( extendedTiers[ 0 ].views ).toEqual( newTiers[ 0 ].views );
		expect( extendedTiers[ 5 ].views ).toEqual( 4e6 );
	} );
} );
