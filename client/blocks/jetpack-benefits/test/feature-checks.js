import {
	JETPACK_ANTI_SPAM_PRODUCTS,
	JETPACK_BACKUP_PRODUCTS,
	JETPACK_SCAN_PRODUCTS,
	JETPACK_SEARCH_PRODUCTS,
	JETPACK_STATS_PRODUCTS,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	PLAN_JETPACK_SECURITY_REALTIME,
	PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
	PLAN_JETPACK_SECURITY_T1_MONTHLY,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PLAN_JETPACK_SECURITY_T1_BI_YEARLY,
	PLAN_JETPACK_SECURITY_T2_MONTHLY,
	PLAN_JETPACK_SECURITY_T2_YEARLY,
	PRODUCT_JETPACK_STATS_BI_YEARLY,
	PRODUCT_JETPACK_STATS_YEARLY,
	PRODUCT_JETPACK_STATS_MONTHLY,
	PRODUCT_JETPACK_STATS_PWYW_YEARLY,
	PRODUCT_JETPACK_STATS_FREE,
	JETPACK_COMPLETE_PLANS,
} from '@automattic/calypso-products';
import {
	productHasAntiSpam,
	productHasBackups,
	productHasSearch,
	productHasScan,
	productHasStats,
} from '../feature-checks';

describe( 'JetpackBenefits Feature Checks', () => {
	// this method is here for debugging
	// these tests loop through multiple toBe conditions for plan/ product strings, this allows to see which value is failing
	// if used, should be replaced with toBe after debugging
	expect.extend( {
		toBeWithError( recieved, expected, value ) {
			const pass = recieved === expected;
			if ( pass ) {
				return {
					pass: true,
				};
			}

			return {
				pass: false,
				message: () => `Failed when passed ${ value }`,
			};
		},
	} );

	// test that checks for different plan/ product features return as expected
	test( 'Plans and products that have backups return true for productHasBackups', () => {
		const plansWithBackup = [
			...JETPACK_BACKUP_PRODUCTS,
			...JETPACK_COMPLETE_PLANS,
			PLAN_JETPACK_BUSINESS, // Professional
			PLAN_JETPACK_BUSINESS_MONTHLY,
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_PERSONAL_MONTHLY,
			PLAN_JETPACK_PREMIUM,
			PLAN_JETPACK_PREMIUM_MONTHLY,
			PLAN_JETPACK_SECURITY_DAILY,
			PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
			PLAN_JETPACK_SECURITY_REALTIME,
			PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
			PLAN_JETPACK_SECURITY_T1_MONTHLY,
			PLAN_JETPACK_SECURITY_T1_YEARLY,
			PLAN_JETPACK_SECURITY_T1_BI_YEARLY,
			PLAN_JETPACK_SECURITY_T2_MONTHLY,
			PLAN_JETPACK_SECURITY_T2_YEARLY,
		];

		plansWithBackup.forEach( ( plan ) => {
			expect( productHasBackups( plan ) ).toBe( true );
		} );
	} );

	// plans without backups return false for productHasBackups
	test( 'Plans and products without backups return false for productHasBackups', () => {
		const plansWithoutBackup = [
			...JETPACK_SCAN_PRODUCTS,
			...JETPACK_ANTI_SPAM_PRODUCTS,
			...JETPACK_SEARCH_PRODUCTS,
		];

		plansWithoutBackup.forEach( ( plan ) => {
			expect( productHasBackups( plan ) ).toBe( false );
		} );
	} );

	// productHasScan
	test( 'Plans and products with scan return true for productHasScan', () => {
		const plansWithScan = [
			...JETPACK_SCAN_PRODUCTS,
			...JETPACK_COMPLETE_PLANS,
			PLAN_JETPACK_PREMIUM,
			PLAN_JETPACK_PREMIUM_MONTHLY,
			PLAN_JETPACK_BUSINESS,
			PLAN_JETPACK_BUSINESS_MONTHLY,
			PLAN_JETPACK_SECURITY_DAILY,
			PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
			PLAN_JETPACK_SECURITY_REALTIME,
			PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
			PLAN_JETPACK_SECURITY_T1_MONTHLY,
			PLAN_JETPACK_SECURITY_T1_YEARLY,
			PLAN_JETPACK_SECURITY_T1_BI_YEARLY,
			PLAN_JETPACK_SECURITY_T2_MONTHLY,
			PLAN_JETPACK_SECURITY_T2_YEARLY,
		];

		plansWithScan.forEach( ( plan ) => {
			expect( productHasScan( plan ) ).toBe( true );
		} );
	} );

	test( 'Plans and products without scan return false for productHasScan', () => {
		const plansWithoutScan = [
			...JETPACK_BACKUP_PRODUCTS,
			...JETPACK_SEARCH_PRODUCTS,
			...JETPACK_ANTI_SPAM_PRODUCTS,
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_PERSONAL_MONTHLY,
		];

		plansWithoutScan.forEach( ( plan ) => {
			expect( productHasScan( plan ) ).toBe( false );
		} );
	} );

	// productHasAntiSpam
	test( 'Plans and products with anti-spam return true for productHasAntiSpam', () => {
		const plansWithAntiSpam = [
			...JETPACK_ANTI_SPAM_PRODUCTS,
			...JETPACK_COMPLETE_PLANS,
			PLAN_JETPACK_BUSINESS, // Professional
			PLAN_JETPACK_BUSINESS_MONTHLY,
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_PERSONAL_MONTHLY,
			PLAN_JETPACK_PREMIUM,
			PLAN_JETPACK_PREMIUM_MONTHLY,
			PLAN_JETPACK_SECURITY_DAILY,
			PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
			PLAN_JETPACK_SECURITY_REALTIME,
			PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
			PLAN_JETPACK_SECURITY_T1_MONTHLY,
			PLAN_JETPACK_SECURITY_T1_YEARLY,
			PLAN_JETPACK_SECURITY_T1_BI_YEARLY,
			PLAN_JETPACK_SECURITY_T2_MONTHLY,
			PLAN_JETPACK_SECURITY_T2_YEARLY,
		];

		plansWithAntiSpam.forEach( ( plan ) => {
			expect( productHasAntiSpam( plan ) ).toBe( true );
		} );
	} );

	test( 'Plans and products without anti-spam return false for productHasAntiSpam', () => {
		const plansWithoutAntiSpam = [
			...JETPACK_BACKUP_PRODUCTS,
			...JETPACK_SCAN_PRODUCTS,
			...JETPACK_SEARCH_PRODUCTS,
		];

		plansWithoutAntiSpam.forEach( ( plan ) => {
			expect( productHasAntiSpam( plan ) ).toBe( false );
		} );
	} );

	// productHasSearch
	test( 'Plans and products with search return true for productHasSearch', () => {
		const plansWithSearch = [
			...JETPACK_SEARCH_PRODUCTS,
			...JETPACK_COMPLETE_PLANS,
			PLAN_JETPACK_BUSINESS,
			PLAN_JETPACK_BUSINESS_MONTHLY,
		];

		plansWithSearch.forEach( ( plan ) => {
			expect( productHasSearch( plan ) ).toBe( true );
		} );
	} );

	test( 'Plans and products without search return false for productHasSearch', () => {
		const plansWithoutSearch = [
			...JETPACK_BACKUP_PRODUCTS,
			...JETPACK_SCAN_PRODUCTS,
			...JETPACK_ANTI_SPAM_PRODUCTS,
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_PERSONAL_MONTHLY,
			PLAN_JETPACK_PREMIUM,
			PLAN_JETPACK_PREMIUM_MONTHLY,
			PLAN_JETPACK_SECURITY_DAILY,
			PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
			PLAN_JETPACK_SECURITY_REALTIME,
			PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
			PLAN_JETPACK_SECURITY_T1_MONTHLY,
			PLAN_JETPACK_SECURITY_T1_YEARLY,
			PLAN_JETPACK_SECURITY_T1_BI_YEARLY,
			PLAN_JETPACK_SECURITY_T2_MONTHLY,
			PLAN_JETPACK_SECURITY_T2_YEARLY,
		];

		plansWithoutSearch.forEach( ( plan ) => {
			expect( productHasSearch( plan ) ).toBe( false );
		} );
	} );

	//productHasStats
	test( 'Plans and products with stats return true for productHasStats', () => {
		const plansWithStats = [ ...JETPACK_STATS_PRODUCTS ];

		plansWithStats.forEach( ( plan ) => {
			expect( productHasStats( plan ) ).toBe( true );
		} );
	} );

	test( 'Plans and products without stats return false for productHasStats', () => {
		const plansWithoutStats = [
			...JETPACK_SEARCH_PRODUCTS,
			...JETPACK_ANTI_SPAM_PRODUCTS,
			PLAN_JETPACK_SECURITY_DAILY,
			PLAN_JETPACK_SECURITY_T2_YEARLY,
		];

		plansWithoutStats.forEach( ( plan ) => {
			expect( productHasStats( plan ) ).toBe( false );
		} );
	} );

	test( 'Plans and products with paid stats return true for productHasStats', () => {
		const plansWithPaidStats = [
			PRODUCT_JETPACK_STATS_MONTHLY,
			PRODUCT_JETPACK_STATS_PWYW_YEARLY,
			PRODUCT_JETPACK_STATS_YEARLY,
			PRODUCT_JETPACK_STATS_BI_YEARLY,
		];

		plansWithPaidStats.forEach( ( plan ) => {
			expect( productHasStats( plan, true ) ).toBe( true );
		} );
	} );

	test( 'Plans and products with free stats return false for productHasStats onlyPaid', () => {
		const plansWithoutPaidStats = [ PRODUCT_JETPACK_STATS_FREE ];

		plansWithoutPaidStats.forEach( ( plan ) => {
			expect( productHasStats( plan, true ) ).toBe( false );
		} );
	} );
} );
