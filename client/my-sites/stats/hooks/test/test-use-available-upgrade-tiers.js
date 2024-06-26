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
	it( 'should return 250k~4m tiers if purchased with little monthly views', () => {
		const usageData = {
			views_limit: 100_000,
			current_tier: { limit: 100_000 },
			billableMonthlyViews: 0,
		};
		const extendedTiers = getAvailableUpgradeTiers( stateFixture, usageData, true );

		expect( extendedTiers.length ).toBe( MAX_TIERS_NUMBER );
		expect( extendedTiers[ 0 ].views ).toEqual( tiers[ 2 ].maximum_units );
		expect( extendedTiers[ 0 ].minimum_price ).toEqual( tiers[ 2 ].minimum_price );
		expect( extendedTiers[ 5 ].views ).toEqual( 4_000_000 );
	} );
	it( 'should return commerical tiers only considering current tier but not bundled plans like Complete - 10k', () => {
		const usageData = {
			views_limit: 110_000,
			current_tier: { limit: 10_000 },
			billableMonthlyViews: 0,
		};
		const extendedTiers = getAvailableUpgradeTiers( stateFixture, usageData, true );

		expect( extendedTiers.length ).toBe( MAX_TIERS_NUMBER );
		expect( extendedTiers[ 0 ].views ).toEqual( tiers[ 1 ].maximum_units );
		expect( extendedTiers[ 0 ].minimum_price ).toEqual( tiers[ 1 ].minimum_price );
		expect( extendedTiers[ 5 ].views ).toEqual( 3_000_000 );
	} );
	it( 'should return commerical tiers only considering current tier but not bundled plans like Complete - no tier', () => {
		const usageData = {
			views_limit: 100_000,
			current_tier: { limit: null },
			billableMonthlyViews: 0,
		};
		const extendedTiers = getAvailableUpgradeTiers( stateFixture, usageData, true );

		expect( extendedTiers.length ).toBe( MAX_TIERS_NUMBER );
		expect( extendedTiers[ 0 ].views ).toEqual( tiers[ 0 ].maximum_units );
		expect( extendedTiers[ 0 ].minimum_price ).toEqual( tiers[ 0 ].minimum_price );
		expect( extendedTiers[ 5 ].views ).toEqual( 2_000_000 );
	} );
	it( 'should return 100k~3m tiers if not purchased with higer monthly views', () => {
		const usageData = {
			views_limit: null,
			current_tier: { limit: null },
			billableMonthlyViews: 10_000,
		};
		const extendedTiers = getAvailableUpgradeTiers( stateFixture, usageData, true );

		expect( extendedTiers.length ).toBe( MAX_TIERS_NUMBER );
		expect( extendedTiers[ 0 ].views ).toEqual( tiers[ 1 ].maximum_units );
		expect( extendedTiers[ 0 ].minimum_price ).toEqual( tiers[ 1 ].minimum_price );
		expect( extendedTiers[ 5 ].views ).toEqual( 3_000_000 );
	} );
	it( 'should return 250k~4m tiers if purchased with higer monthly views', () => {
		const usageData = {
			views_limit: 10_000,
			current_tier: { limit: 10_000 },
			billableMonthlyViews: 100_001,
		};
		const extendedTiers = getAvailableUpgradeTiers( stateFixture, usageData, true );

		expect( extendedTiers.length ).toBe( MAX_TIERS_NUMBER );
		expect( extendedTiers[ 0 ].views ).toEqual( tiers[ 2 ].maximum_units );
		expect( extendedTiers[ 0 ].minimum_price ).toEqual( tiers[ 2 ].minimum_price );
		expect( extendedTiers[ 5 ].views ).toEqual( 4_000_000 );
	} );
	it( 'should return 2~7m tiers if not purchased with 1m+ monthly views', () => {
		const usageData = {
			views_limit: null,
			current_tier: { limit: null },
			billableMonthlyViews: 1_000_001,
		};
		const extendedTiers = getAvailableUpgradeTiers( stateFixture, usageData, true );

		expect( extendedTiers.length ).toBe( MAX_TIERS_NUMBER );
		expect( extendedTiers[ 0 ].views ).toEqual( 2_000_000 );
		expect( extendedTiers[ 0 ].minimum_price ).toEqual( 95000 );
		// the price for 7m views - 95000 + 25000 * 5
		expect( extendedTiers[ 5 ].minimum_price ).toEqual( 220_000 );
		expect( extendedTiers[ 5 ].views ).toEqual( 7_000_000 );
	} );
	it( 'should return 3~8m tiers if purchased 1m and with 2m monthly views', () => {
		const usageData = {
			views_limit: 1_000_000,
			current_tier: { limit: 1_000_000 },
			billableMonthlyViews: 2_000_001,
		};
		const extendedTiers = getAvailableUpgradeTiers( stateFixture, usageData, true );

		expect( extendedTiers.length ).toBe( MAX_TIERS_NUMBER );
		expect( extendedTiers[ 0 ].views ).toEqual( 3_000_000 );
		expect( extendedTiers[ 0 ].minimum_price ).toEqual( 120000 );
		expect( extendedTiers[ 5 ].views ).toEqual( 8_000_000 );
	} );
	it( 'should return 17~22 tiers if purchased 10m and with 16m500k (not exact millions) monthly views', () => {
		const usageData = {
			views_limit: 1_000_000,
			current_tier: { limit: 1_000_000 },
			billableMonthlyViews: 16_500_000,
		};
		const extendedTiers = getAvailableUpgradeTiers( stateFixture, usageData, true );

		expect( extendedTiers.length ).toBe( MAX_TIERS_NUMBER );
		expect( extendedTiers[ 0 ].views ).toEqual( 17_000_000 );
		expect( extendedTiers[ 0 ].minimum_price ).toEqual( 470_000 );
		expect( extendedTiers[ 5 ].views ).toEqual( 22_000_000 );
	} );
	it( 'should return proper upgrade prices - 1m to 17m', () => {
		const usageData = {
			views_limit: 1_000_000,
			current_tier: { minimum_price: 70000, limit: 1_000_000 },
			billableMonthlyViews: 16_500_001,
		};
		const extendedTiers = getAvailableUpgradeTiers( stateFixture, usageData, true );

		expect( extendedTiers.length ).toBe( MAX_TIERS_NUMBER );
		expect( extendedTiers[ 0 ].views ).toEqual( 17_000_000 );
		expect( extendedTiers[ 0 ].minimum_price ).toEqual( 470_000 );
		expect( extendedTiers[ 0 ].upgrade_price ).toEqual( 400_000 );
		expect( extendedTiers[ 5 ].views ).toEqual( 22_000_000 );
		expect( extendedTiers[ 5 ].minimum_price ).toEqual( 595_000 );
		expect( extendedTiers[ 5 ].upgrade_price ).toEqual( 525_000 );
	} );
	it( 'should return proper upgrade prices - 100k to 500k', () => {
		const usageData = {
			views_limit: 100_000,
			current_tier: { minimum_price: 20000, limit: 100_000 },
			billableMonthlyViews: 260_000,
		};
		const extendedTiers = getAvailableUpgradeTiers( stateFixture, usageData, true );

		expect( extendedTiers.length ).toBe( MAX_TIERS_NUMBER );
		expect( extendedTiers[ 0 ].views ).toEqual( 500_000 );
		expect( extendedTiers[ 0 ].minimum_price ).toEqual( 50_000 );
		expect( extendedTiers[ 0 ].upgrade_price ).toEqual( 30_000 );
		expect( extendedTiers[ 5 ].views ).toEqual( 5_000_000 );
		expect( extendedTiers[ 5 ].minimum_price ).toEqual( 170_000 );
		expect( extendedTiers[ 5 ].upgrade_price ).toEqual( 150_000 );
	} );
	it( 'should return proper upgrade prices - 10k to 2m', () => {
		const usageData = {
			views_limit: 10_000,
			current_tier: { minimum_price: 10000, limit: 10_000 },
			billableMonthlyViews: 1_000_010,
		};
		const extendedTiers = getAvailableUpgradeTiers( stateFixture, usageData, true );

		expect( extendedTiers.length ).toBe( MAX_TIERS_NUMBER );
		expect( extendedTiers[ 0 ].views ).toEqual( 2_000_000 );
		expect( extendedTiers[ 0 ].minimum_price ).toEqual( 95_000 );
		expect( extendedTiers[ 0 ].upgrade_price ).toEqual( 85_000 );
		expect( extendedTiers[ 5 ].views ).toEqual( 7_000_000 );
		expect( extendedTiers[ 5 ].minimum_price ).toEqual( 220_000 );
		expect( extendedTiers[ 5 ].upgrade_price ).toEqual( 210_000 );
	} );
	it( 'should return proper upgrade tiers for sites with bundled plans', () => {
		const usageData = {
			views_limit: 110_000,
			current_tier: { minimum_price: 10000, limit: 10_000 },
			billableMonthlyViews: 1_000_010,
		};
		const extendedTiers = getAvailableUpgradeTiers( stateFixture, usageData, true );

		expect( extendedTiers.length ).toBe( MAX_TIERS_NUMBER );
		expect( extendedTiers[ 0 ].views ).toEqual( 1_000_000 );
		expect( extendedTiers[ 0 ].minimum_price ).toEqual( 70_000 );
		expect( extendedTiers[ 0 ].upgrade_price ).toEqual( 60_000 );
		expect( extendedTiers[ 5 ].views ).toEqual( 6_000_000 );
		expect( extendedTiers[ 5 ].minimum_price ).toEqual( 195_000 );
		expect( extendedTiers[ 5 ].upgrade_price ).toEqual( 185_000 );
	} );
} );
