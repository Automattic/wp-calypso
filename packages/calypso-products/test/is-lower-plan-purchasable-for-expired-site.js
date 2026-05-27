import {
	PLAN_BLOGGER,
	PLAN_BUSINESS,
	PLAN_BUSINESS_MONTHLY,
	PLAN_ECOMMERCE,
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PERSONAL_MONTHLY,
	PLAN_PREMIUM,
	PLAN_PREMIUM_MONTHLY,
} from '../src/constants';
import { isLowerPlanPurchasableForExpiredSite } from '../src/is-lower-plan-purchasable-for-expired-site';

const DAY_MS = 24 * 60 * 60 * 1000;

describe( 'isLowerPlanPurchasableForExpiredSite', () => {
	describe( 'source plan eligibility', () => {
		it( 'returns false when the current plan is Free', () => {
			expect( isLowerPlanPurchasableForExpiredSite( PLAN_FREE, PLAN_PERSONAL ) ).toBe( false );
		} );

		it( 'returns false when the current plan is Blogger (not eligible)', () => {
			expect( isLowerPlanPurchasableForExpiredSite( PLAN_BLOGGER, PLAN_PERSONAL ) ).toBe( false );
		} );

		it( 'allows Commerce as a source tier', () => {
			expect( isLowerPlanPurchasableForExpiredSite( PLAN_ECOMMERCE, PLAN_BUSINESS ) ).toBe( true );
		} );

		it( 'returns false for an unknown plan slug', () => {
			expect( isLowerPlanPurchasableForExpiredSite( 'made-up-plan', PLAN_PERSONAL ) ).toBe( false );
		} );
	} );

	describe( 'tier ordering', () => {
		it( 'allows Business → Personal', () => {
			expect( isLowerPlanPurchasableForExpiredSite( PLAN_BUSINESS, PLAN_PERSONAL ) ).toBe( true );
		} );

		it( 'allows Business → Premium', () => {
			expect( isLowerPlanPurchasableForExpiredSite( PLAN_BUSINESS, PLAN_PREMIUM ) ).toBe( true );
		} );

		it( 'allows Premium → Personal', () => {
			expect( isLowerPlanPurchasableForExpiredSite( PLAN_PREMIUM, PLAN_PERSONAL ) ).toBe( true );
		} );

		it( 'allows Commerce → Business', () => {
			expect( isLowerPlanPurchasableForExpiredSite( PLAN_ECOMMERCE, PLAN_BUSINESS ) ).toBe( true );
		} );

		it( 'allows Commerce → Premium', () => {
			expect( isLowerPlanPurchasableForExpiredSite( PLAN_ECOMMERCE, PLAN_PREMIUM ) ).toBe( true );
		} );

		it( 'allows Commerce → Personal', () => {
			expect( isLowerPlanPurchasableForExpiredSite( PLAN_ECOMMERCE, PLAN_PERSONAL ) ).toBe( true );
		} );

		it( 'allows Personal → Free (Free is a lower tier)', () => {
			expect( isLowerPlanPurchasableForExpiredSite( PLAN_PERSONAL, PLAN_FREE ) ).toBe( true );
		} );

		it( 'rejects same-tier transitions', () => {
			expect( isLowerPlanPurchasableForExpiredSite( PLAN_PERSONAL, PLAN_PERSONAL ) ).toBe( false );
			expect( isLowerPlanPurchasableForExpiredSite( PLAN_PREMIUM, PLAN_PREMIUM ) ).toBe( false );
			expect( isLowerPlanPurchasableForExpiredSite( PLAN_BUSINESS, PLAN_BUSINESS ) ).toBe( false );
		} );

		it( 'rejects upgrades (Personal → Premium)', () => {
			expect( isLowerPlanPurchasableForExpiredSite( PLAN_PERSONAL, PLAN_PREMIUM ) ).toBe( false );
		} );

		it( 'rejects upgrades (Premium → Business)', () => {
			expect( isLowerPlanPurchasableForExpiredSite( PLAN_PREMIUM, PLAN_BUSINESS ) ).toBe( false );
		} );

		it( 'rejects upgrades to Commerce', () => {
			expect( isLowerPlanPurchasableForExpiredSite( PLAN_BUSINESS, PLAN_ECOMMERCE ) ).toBe( false );
		} );
	} );

	describe( 'monthly plan delay', () => {
		it( 'rejects monthly Business → Personal when expired less than 6 days ago', () => {
			const threeDaysAgo = new Date( Date.now() - 3 * DAY_MS );
			expect(
				isLowerPlanPurchasableForExpiredSite( PLAN_BUSINESS_MONTHLY, PLAN_PERSONAL, threeDaysAgo )
			).toBe( false );
		} );

		it( 'allows monthly Business → Personal when expired more than 6 days ago', () => {
			const sevenDaysAgo = new Date( Date.now() - 7 * DAY_MS );
			expect(
				isLowerPlanPurchasableForExpiredSite( PLAN_BUSINESS_MONTHLY, PLAN_PERSONAL, sevenDaysAgo )
			).toBe( true );
		} );

		it( 'accepts ISO date strings for expiryDate', () => {
			const sevenDaysAgo = new Date( Date.now() - 7 * DAY_MS ).toISOString();
			expect(
				isLowerPlanPurchasableForExpiredSite(
					PLAN_PREMIUM_MONTHLY,
					PLAN_PERSONAL_MONTHLY,
					sevenDaysAgo
				)
			).toBe( true );
		} );

		it( 'skips the delay for yearly plans even if expiry is recent', () => {
			const oneDayAgo = new Date( Date.now() - 1 * DAY_MS );
			expect(
				isLowerPlanPurchasableForExpiredSite( PLAN_BUSINESS, PLAN_PERSONAL, oneDayAgo )
			).toBe( true );
		} );

		it( 'skips the delay for monthly plans when expiryDate is omitted', () => {
			expect( isLowerPlanPurchasableForExpiredSite( PLAN_BUSINESS_MONTHLY, PLAN_PERSONAL ) ).toBe(
				true
			);
		} );
	} );
} );
