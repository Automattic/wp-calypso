/**
 * Internal dependencies
 */
import getActiveDiscount, { isDiscountActive } from 'state/selectors/get-active-discount';
import { hasActivePromotion } from 'state/active-promotions/selectors';
import { getSitePlanSlug } from 'state/sites/selectors';
import { abtest } from 'lib/abtest';
import discounts from 'lib/discounts';
import {
	PLAN_PREMIUM_2_YEARS,
	TYPE_FREE,
	TYPE_PREMIUM,
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
} from 'lib/plans/constants';

jest.mock( 'state/active-promotions/selectors', () => ( {
	hasActivePromotion: jest.fn( () => null ),
} ) );

jest.mock( 'lib/abtest', () => ( {
	abtest: jest.fn( () => null ),
} ) );

jest.mock( 'lib/discounts', () => ( {
	activeDiscounts: [],
} ) );

jest.mock( 'state/sites/selectors', () => ( {
	getSitePlanSlug: jest.fn( () => null ),
} ) );

jest.mock( 'state/ui/selectors', () => ( {
	getSelectedSiteId: jest.fn( () => 1 ),
} ) );

const DatePlusTime = ( time ) => {
	const now = new Date();
	now.setTime( now.getTime() + time );
	return now;
};

describe( 'isDiscountActive()', () => {
	describe( 'General', () => {
		beforeEach( () => {
			hasActivePromotion.mockImplementation( () => true );
			abtest.mockImplementation( () => 'upsell' );
		} );

		test( 'should return false for an empty discount', () => {
			expect( isDiscountActive( {} ) ).toBe( false );
		} );
	} );

	describe( 'Date ranges', () => {
		beforeEach( () => {
			hasActivePromotion.mockImplementation( () => true );
			abtest.mockImplementation( () => 'upsell' );
		} );

		test( 'should return null if available discounts did not start yet', () => {
			expect(
				isDiscountActive( {
					startsAt: DatePlusTime( 10 ),
					endsAt: DatePlusTime( 100 ),
				} )
			).toBe( false );
		} );

		test( 'should return null if available discounts is already finished', () => {
			expect(
				isDiscountActive( {
					startsAt: new Date( 2018, 1, 1 ),
					endsAt: DatePlusTime( -10 ),
				} )
			).toBe( false );
		} );

		test( 'should return discount if available discounts is currently running', () => {
			expect(
				isDiscountActive( {
					startsAt: DatePlusTime( -10 ),
					endsAt: DatePlusTime( 100 ),
				} )
			).toBe( true );
		} );
	} );

	describe( 'State checks', () => {
		beforeEach( () => {
			hasActivePromotion.mockImplementation( () => true );
			abtest.mockImplementation( () => 'upsell' );
		} );

		test( 'should return false if hasActivePromotion returns false', () => {
			hasActivePromotion.mockImplementation( () => false );
			expect(
				isDiscountActive( {
					startsAt: DatePlusTime( -10 ),
					endsAt: DatePlusTime( 100 ),
				} )
			).toBe( false );
		} );

		test( 'should return true if hasActivePromotion returns true', () => {
			hasActivePromotion.mockImplementation( () => true );
			expect(
				isDiscountActive( {
					startsAt: DatePlusTime( -10 ),
					endsAt: DatePlusTime( 100 ),
				} )
			).toBe( true );
		} );
	} );

	describe( 'AB test checks', () => {
		beforeEach( () => {
			hasActivePromotion.mockImplementation( () => true );
		} );

		test( 'should return true if there is no ab test', () => {
			expect(
				isDiscountActive( {
					startsAt: DatePlusTime( -10 ),
					endsAt: DatePlusTime( 100 ),
				} )
			).toBe( true );
		} );

		test( 'should return false if hasActivePromotion returns control', () => {
			abtest.mockImplementation( () => 'control' );
			expect(
				isDiscountActive( {
					abTestName: 'abtest_one',
					startsAt: DatePlusTime( -10 ),
					endsAt: DatePlusTime( 100 ),
				} )
			).toBe( false );
		} );

		test( 'should return true if hasActivePromotion returns upsell', () => {
			abtest.mockImplementation( () => 'upsell' );
			expect(
				isDiscountActive( {
					abTestName: 'abtest_one',
					startsAt: DatePlusTime( -10 ),
					endsAt: DatePlusTime( 100 ),
				} )
			).toBe( true );
		} );
	} );

	describe( 'Target plans check', () => {
		beforeEach( () => {
			hasActivePromotion.mockImplementation( () => true );
			abtest.mockImplementation( () => 'upsell' );
		} );

		test( 'should return true if there are no target plans', () => {
			expect(
				isDiscountActive( {
					startsAt: DatePlusTime( -10 ),
					endsAt: DatePlusTime( 100 ),
				} )
			).toBe( true );
		} );

		test( 'should return true if target plan matches the selected site plan', () => {
			getSitePlanSlug.mockImplementation( () => PLAN_PREMIUM_2_YEARS );

			expect(
				isDiscountActive( {
					startsAt: DatePlusTime( -10 ),
					endsAt: DatePlusTime( 100 ),
					targetPlans: [ { type: TYPE_PREMIUM } ],
				} )
			).toBe( true );

			expect(
				isDiscountActive( {
					startsAt: DatePlusTime( -10 ),
					endsAt: DatePlusTime( 100 ),
					targetPlans: [ { type: TYPE_PREMIUM, term: TERM_BIENNIALLY } ],
				} )
			).toBe( true );
		} );

		test( 'should return false if target plans do not match the selected site plan', () => {
			getSitePlanSlug.mockImplementation( () => PLAN_PREMIUM_2_YEARS );

			expect(
				isDiscountActive( {
					startsAt: DatePlusTime( -10 ),
					endsAt: DatePlusTime( 100 ),
					targetPlans: [ { type: TYPE_FREE } ],
				} )
			).toBe( false );

			expect(
				isDiscountActive( {
					startsAt: DatePlusTime( -10 ),
					endsAt: DatePlusTime( 100 ),
					targetPlans: [ { type: TYPE_PREMIUM, term: TERM_ANNUALLY } ],
				} )
			).toBe( false );
		} );
	} );
} );

describe( 'getActiveDiscount()', () => {
	beforeEach( () => {
		hasActivePromotion.mockImplementation( () => true );
		abtest.mockImplementation( () => 'upsell' );
	} );

	test( 'should return null when there are no discounts', () => {
		discounts.activeDiscounts = [];
		expect( getActiveDiscount( {} ) ).toBe( null );
	} );

	test( 'should return an active discount when there is one', () => {
		const promo = {
			startsAt: DatePlusTime( -10 ),
			endsAt: DatePlusTime( 100 ),
		};
		discounts.activeDiscounts = [ promo ];
		expect( getActiveDiscount( {} ) ).toEqual( promo );
	} );

	test( 'should return an active discount with merged variant when there is a variant', () => {
		abtest.mockImplementation( () => 'upsell10' );
		const promo = {
			startsAt: DatePlusTime( -10 ),
			endsAt: DatePlusTime( 100 ),
			variations: {
				upsell10: {
					name: 'upsell10 name',
				},
			},
		};
		discounts.activeDiscounts = [ promo ];
		expect( getActiveDiscount( {} ) ).toEqual( {
			...promo,
			name: 'upsell10 name',
		} );
	} );
} );
