/**
 * Internal dependencies
 */
import {
	JETPACK_ANTI_SPAM_PRODUCTS,
	JETPACK_BACKUP_PRODUCTS,
	JETPACK_SCAN_PRODUCTS,
	JETPACK_SEARCH_PRODUCTS,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_MONTHLY,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	PLAN_JETPACK_SECURITY_REALTIME,
	PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
} from '@automattic/calypso-products';
import { JetpackBenefits } from '../index';

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
			PLAN_JETPACK_BUSINESS, // Professional
			PLAN_JETPACK_BUSINESS_MONTHLY,
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_PERSONAL_MONTHLY,
			PLAN_JETPACK_PREMIUM,
			PLAN_JETPACK_PREMIUM_MONTHLY,
			PLAN_JETPACK_COMPLETE,
			PLAN_JETPACK_COMPLETE_MONTHLY,
			PLAN_JETPACK_SECURITY_DAILY,
			PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
			PLAN_JETPACK_SECURITY_REALTIME,
			PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
		];
		const benefits = new JetpackBenefits( {} );

		plansWithBackup.forEach( ( plan ) => {
			expect( benefits.productHasBackups( plan ) ).toBe( true );
		} );
	} );

	// plans without backups return false for productHasBackups
	test( 'Plans and products without backups return false for productHasBackups', () => {
		const plansWithoutBackup = [
			...JETPACK_SCAN_PRODUCTS,
			...JETPACK_ANTI_SPAM_PRODUCTS,
			...JETPACK_SEARCH_PRODUCTS,
		];
		const benefits = new JetpackBenefits( {} );

		plansWithoutBackup.forEach( ( plan ) => {
			expect( benefits.productHasBackups( plan ) ).toBe( false );
		} );
	} );

	// productHasScan
	test( 'Plans and products with scan return true for productHasScan', () => {
		const plansWithScan = [
			...JETPACK_SCAN_PRODUCTS,
			PLAN_JETPACK_PREMIUM,
			PLAN_JETPACK_PREMIUM_MONTHLY,
			PLAN_JETPACK_BUSINESS,
			PLAN_JETPACK_BUSINESS_MONTHLY,
			PLAN_JETPACK_COMPLETE,
			PLAN_JETPACK_COMPLETE_MONTHLY,
			PLAN_JETPACK_SECURITY_DAILY,
			PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
			PLAN_JETPACK_SECURITY_REALTIME,
			PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
		];
		const benefits = new JetpackBenefits( {} );

		plansWithScan.forEach( ( plan ) => {
			expect( benefits.productHasScan( plan ) ).toBe( true );
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

		const benefits = new JetpackBenefits( {} );

		plansWithoutScan.forEach( ( plan ) => {
			expect( benefits.productHasScan( plan ) ).toBe( false );
		} );
	} );

	// productHasAntiSpam
	test( 'Plans and products with anti-spam return true for productHasAntiSpam', () => {
		const plansWithAntiSpam = [
			...JETPACK_ANTI_SPAM_PRODUCTS,
			PLAN_JETPACK_BUSINESS, // Professional
			PLAN_JETPACK_BUSINESS_MONTHLY,
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_PERSONAL_MONTHLY,
			PLAN_JETPACK_PREMIUM,
			PLAN_JETPACK_PREMIUM_MONTHLY,
			PLAN_JETPACK_COMPLETE,
			PLAN_JETPACK_COMPLETE_MONTHLY,
			PLAN_JETPACK_SECURITY_DAILY,
			PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
			PLAN_JETPACK_SECURITY_REALTIME,
			PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
		];

		const benefits = new JetpackBenefits( {} );

		plansWithAntiSpam.forEach( ( plan ) => {
			expect( benefits.productHasAntiSpam( plan ) ).toBe( true );
		} );
	} );

	test( 'Plans and products without anti-spam return false for productHasAntiSpam', () => {
		const plansWithoutAntiSpam = [
			...JETPACK_BACKUP_PRODUCTS,
			...JETPACK_SCAN_PRODUCTS,
			...JETPACK_SEARCH_PRODUCTS,
		];

		const benefits = new JetpackBenefits( {} );

		plansWithoutAntiSpam.forEach( ( plan ) => {
			expect( benefits.productHasAntiSpam( plan ) ).toBe( false );
		} );
	} );

	// productHasSearch
	test( 'Plans and products with search return true for productHasSearch', () => {
		const plansWithSearch = [
			...JETPACK_SEARCH_PRODUCTS,
			PLAN_JETPACK_BUSINESS,
			PLAN_JETPACK_BUSINESS_MONTHLY,
			PLAN_JETPACK_COMPLETE,
			PLAN_JETPACK_COMPLETE_MONTHLY,
		];

		const benefits = new JetpackBenefits( {} );

		plansWithSearch.forEach( ( plan ) => {
			expect( benefits.productHasSearch( plan ) ).toBe( true );
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
		];

		const benefits = new JetpackBenefits( {} );

		plansWithoutSearch.forEach( ( plan ) => {
			expect( benefits.productHasSearch( plan ) ).toBe( false );
		} );
	} );
} );
