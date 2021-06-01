/**
 * Internal dependencies
 */
import getActiveDiscount, { isDiscountActive } from 'calypso/state/selectors/get-active-discount';
import { hasActivePromotion } from 'calypso/state/active-promotions/selectors';
import { getSitePlanSlug } from 'calypso/state/sites/selectors';
import { activeDiscounts } from 'calypso/lib/discounts';
import {
	PLAN_PREMIUM_2_YEARS,
	TYPE_FREE,
	TYPE_PREMIUM,
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
} from '@automattic/calypso-products';

jest.mock( 'calypso/state/active-promotions/selectors', () => ( {
	hasActivePromotion: jest.fn( () => null ),
} ) );

jest.mock( 'calypso/lib/discounts', () => ( {
	activeDiscounts: [],
} ) );

jest.mock( 'calypso/state/sites/selectors', () => ( {
	getSitePlanSlug: jest.fn( () => null ),
} ) );

jest.mock( 'calypso/state/ui/selectors', () => ( {
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
		} );

		test( 'should return false for an empty discount', () => {
			expect( isDiscountActive( {} ) ).toBe( false );
		} );
	} );

	describe( 'Date ranges', () => {
		beforeEach( () => {
			hasActivePromotion.mockImplementation( () => true );
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

	describe( 'Target plans check', () => {
		beforeEach( () => {
			hasActivePromotion.mockImplementation( () => true );
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
	} );
	afterEach( () => {
		activeDiscounts.length = 0;
	} );

	test( 'should return null when there are no discounts', () => {
		expect( getActiveDiscount( {} ) ).toBe( null );
	} );

	test( 'should return an active discount when there is one', () => {
		const promo = {
			startsAt: DatePlusTime( -10 ),
			endsAt: DatePlusTime( 100 ),
		};
		activeDiscounts.push( promo );
		expect( getActiveDiscount( {} ) ).toEqual( promo );
	} );
} );
