import { getAvailableUpgradeTiers, MAX_TIERS_NUMBER } from '../use-available-upgrade-tiers';
import stateFixture from './original-tiers-fixture.json';

const tiers = stateFixture.productsList.items.jetpack_stats_yearly.price_tier_list;

describe( 'getAvailableUpgradeTiers', () => {
	it( 'should return original tiers if not purchased or with no monthly views', () => {
		const usageData = { views_limit: null, billableMonthlyViews: 0 };
		const extendedTiers = getAvailableUpgradeTiers( stateFixture, usageData, true );

		expect( extendedTiers.length ).toBe( MAX_TIERS_NUMBER );
		expect( extendedTiers[ 0 ].views ).toEqual( tiers[ 0 ].maximum_units );
		expect( extendedTiers[ 0 ].minimum_price ).toEqual( tiers[ 0 ].minimum_price );
		expect( extendedTiers[ 4 ].views ).toEqual( tiers[ 4 ].maximum_units );
		expect( extendedTiers[ 4 ].minimum_price ).toEqual( tiers[ 4 ].minimum_price );
		expect( extendedTiers[ 5 ].views ).toEqual( 2_000_000 );
	} );
	it( 'should return 250k~4m tiers if purchased and with little monthly views', () => {
		const usageData = { views_limit: 100_000, billableMonthlyViews: 0 };
		const extendedTiers = getAvailableUpgradeTiers( stateFixture, usageData, true );

		expect( extendedTiers.length ).toBe( MAX_TIERS_NUMBER );
		expect( extendedTiers[ 0 ].views ).toEqual( tiers[ 2 ].maximum_units );
		expect( extendedTiers[ 0 ].minimum_price ).toEqual( tiers[ 2 ].minimum_price );
		expect( extendedTiers[ 5 ].views ).toEqual( 4_000_000 );
	} );
	it( 'should return 100k~3m tiers if not purchased and higer monthly views', () => {
		const usageData = { views_limit: null, billableMonthlyViews: 10_000 };
		const extendedTiers = getAvailableUpgradeTiers( stateFixture, usageData, true );

		expect( extendedTiers.length ).toBe( MAX_TIERS_NUMBER );
		expect( extendedTiers[ 0 ].views ).toEqual( tiers[ 1 ].maximum_units );
		expect( extendedTiers[ 0 ].minimum_price ).toEqual( tiers[ 1 ].minimum_price );
		expect( extendedTiers[ 5 ].views ).toEqual( 3_000_000 );
	} );
	it( 'should return 250k~4m tiers if purchased and higer monthly views', () => {
		const usageData = { views_limit: 100_00, billableMonthlyViews: 100_001 };
		const extendedTiers = getAvailableUpgradeTiers( stateFixture, usageData, true );

		expect( extendedTiers.length ).toBe( MAX_TIERS_NUMBER );
		expect( extendedTiers[ 0 ].views ).toEqual( tiers[ 2 ].maximum_units );
		expect( extendedTiers[ 0 ].minimum_price ).toEqual( tiers[ 2 ].minimum_price );
		expect( extendedTiers[ 5 ].views ).toEqual( 4_000_000 );
	} );
	it( 'should return 2m~7m tiers if not purchased and 1m+ monthly views', () => {
		const usageData = { views_limit: null, billableMonthlyViews: 1_000_001 };
		const extendedTiers = getAvailableUpgradeTiers( stateFixture, usageData, true );

		expect( extendedTiers.length ).toBe( MAX_TIERS_NUMBER );
		expect( extendedTiers[ 0 ].views ).toEqual( 2_000_000 );
		expect( extendedTiers[ 0 ].minimum_price ).toEqual( 95000 );
		// the price for 7m views - 95000 + 25000 * 5
		expect( extendedTiers[ 5 ].minimum_price ).toEqual( 220_000 );
		expect( extendedTiers[ 5 ].views ).toEqual( 7_000_000 );
	} );
} );
