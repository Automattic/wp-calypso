/**
 * External dependencies
 */
import moment from 'moment';

/**
 * Internal dependencies
 */
import {
	isRemovable,
	isCancelable,
	isPaidWithCredits,
	hasPaymentMethod,
	maybeWithinRefundPeriod,
	subscribedWithinPastWeek,
} from '../index';

import {
	DOMAIN_PURCHASE,
	DOMAIN_PURCHASE_PENDING_TRANSFER,
	DOMAIN_PURCHASE_EXPIRED,
	DOMAIN_PURCHASE_INCLUDED_IN_PLAN,
	DOMAIN_MAPPING_PURCHASE,
	DOMAIN_MAPPING_PURCHASE_EXPIRED,
	PLAN_PURCHASE,
	SITE_REDIRECT_PURCHASE,
	SITE_REDIRECT_PURCHASE_EXPIRED,
	PLAN_PURCHASE_WITH_CREDITS,
	PLAN_PURCHASE_WITH_PAYPAL,
} from './data';

// Gets rid of warnings such as 'UnhandledPromiseRejectionWarning: Error: No available storage method found.'
jest.mock( 'lib/user', () => () => {} );

describe( 'index', () => {
	describe( '#isRemovable', () => {
		test( 'should not be removable when domain registration purchase is not expired', () => {
			expect( isRemovable( DOMAIN_PURCHASE ) ).toEqual( false );
		} );

		test( 'should not be removable when domain mapping purchase is not expired', () => {
			expect( isRemovable( DOMAIN_MAPPING_PURCHASE ) ).toEqual( false );
		} );

		test( 'should not be removable when site redirect purchase is not expired', () => {
			expect( isRemovable( SITE_REDIRECT_PURCHASE ) ).toEqual( false );
		} );

		test( 'should be removable when domain registration purchase is expired', () => {
			expect( isRemovable( DOMAIN_PURCHASE_EXPIRED ) ).toEqual( true );
		} );

		test( 'should be removable when domain mapping purchase is expired', () => {
			expect( isRemovable( DOMAIN_MAPPING_PURCHASE_EXPIRED ) ).toEqual( true );
		} );

		test( 'should be removable when site redirect purchase is expired', () => {
			expect( isRemovable( SITE_REDIRECT_PURCHASE_EXPIRED ) ).toEqual( true );
		} );
	} );
	describe( '#isCancelable', () => {
		test( 'should not be cancelable when the purchase is included in a plan', () => {
			expect( isCancelable( DOMAIN_PURCHASE_INCLUDED_IN_PLAN ) ).toEqual( false );
		} );

		test( 'should not be cancelable when the purchase is expired', () => {
			expect( isCancelable( DOMAIN_PURCHASE_EXPIRED ) ).toEqual( false );
		} );

		test( 'should be cancelable when the purchase is refundable', () => {
			expect( isCancelable( DOMAIN_PURCHASE ) ).toEqual( true );
		} );

		test( 'should be cancelable when the purchase can have auto-renew disabled', () => {
			expect( isCancelable( PLAN_PURCHASE ) ).toEqual( true );
		} );

		test( 'should not be cancelable if domain is pending transfer', () => {
			expect( isCancelable( DOMAIN_PURCHASE_PENDING_TRANSFER ) ).toEqual( false );
		} );
	} );
	describe( '#isPaidWithCredits', () => {
		test( 'should be true when paid with credits', () => {
			expect( isPaidWithCredits( PLAN_PURCHASE_WITH_CREDITS ) ).toEqual( true );
		} );
		test( 'should false when not paid with credits', () => {
			expect( isPaidWithCredits( PLAN_PURCHASE_WITH_PAYPAL ) ).toEqual( false );
		} );
		test( 'should be false when payment not set on purchase', () => {
			expect( isPaidWithCredits( {} ) ).toEqual( false );
		} );
	} );
	describe( '#hasPaymentMethod', () => {
		test( 'should be false if no payment data at all', () => {
			expect( hasPaymentMethod( {} ) ).toEqual( false );
		} );
		test( 'should be false if no payment type', () => {
			expect(
				hasPaymentMethod( {
					payment: {},
				} )
			).toEqual( false );
		} );
		test( 'should be true if a payment type is available', () => {
			expect(
				hasPaymentMethod( {
					payment: {
						type: 'paypal',
					},
				} )
			).toEqual( true );
		} );
	} );
	describe( '#maybeWithinRefundPeriod', () => {
		test( 'should be true if less time than the refund period has elapsed since the subscription date', () => {
			expect(
				maybeWithinRefundPeriod( {
					isRefundable: false,
					refundPeriodInDays: 2,
					subscribedDate: moment().subtract( 1, 'days' ).format(),
				} )
			).toEqual( true );
		} );
		test( 'should be true if the same amount of time as the refund period has elapsed since the subscription date', () => {
			expect(
				maybeWithinRefundPeriod( {
					isRefundable: false,
					refundPeriodInDays: 2,
					subscribedDate: moment().subtract( 2, 'days' ).format(),
				} )
			).toEqual( true );
		} );
		test( 'should be true if less than a full day beyond the refund period has elapsed since the subscription date', () => {
			// Give users the benefit of the doubt, due to timezones, etc.
			expect(
				maybeWithinRefundPeriod( {
					isRefundable: false,
					refundPeriodInDays: 2,
					subscribedDate: moment().subtract( 71, 'hours' ).format(),
				} )
			).toEqual( true );
		} );
		test( 'should be false if one more day than the refund period has elapsed since the subscription date', () => {
			expect(
				maybeWithinRefundPeriod( {
					isRefundable: false,
					refundPeriodInDays: 2,
					subscribedDate: moment().subtract( 3, 'days' ).format(),
				} )
			).toEqual( false );
		} );
		test( 'should be true if the purchase is marked as refundable, regardless of how much time has elapsed since the subscription date', () => {
			expect(
				maybeWithinRefundPeriod( {
					isRefundable: true,
					refundPeriodInDays: 2,
					subscribedDate: moment().subtract( 3, 'days' ).format(),
				} )
			).toEqual( true );
		} );
		test( 'should be false if the refundPeriodInDays property is not set on the purchase', () => {
			expect(
				maybeWithinRefundPeriod( {
					isRefundable: false,
					subscribedDate: moment().subtract( 1, 'days' ).format(),
				} )
			).toEqual( false );
		} );
		test( 'should be false if the subscribedDate property is not set on the purchase', () => {
			expect(
				maybeWithinRefundPeriod( {
					isRefundable: false,
					refundPeriodInDays: 2,
				} )
			).toEqual( false );
		} );
	} );
	describe( '#subscribedWithinPastWeek', () => {
		test( 'should return false when no subscribed date', () => {
			expect( subscribedWithinPastWeek( {} ) ).toEqual( false );
		} );
		test( 'should return false when subscribed more than 1 week ago', () => {
			expect(
				subscribedWithinPastWeek( {
					subscribedDate: moment().subtract( 8, 'days' ).format(),
				} )
			).toEqual( false );
		} );
		test( 'should return true when subscribed less than 1 week ago', () => {
			expect(
				subscribedWithinPastWeek( {
					subscribedDate: moment().subtract( 3, 'days' ).format(),
				} )
			).toEqual( true );
		} );
	} );
		} );
	} );
} );
