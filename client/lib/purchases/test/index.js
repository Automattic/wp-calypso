/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { isRemovable, isCancelable, isPaidWithCredits, subscribedWithinPastWeek } from '../index';

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

describe( 'index', () => {
	describe( '#isRemovable', () => {
		test( 'should not be removable when domain registration purchase is not expired', () => {
			expect( isRemovable( DOMAIN_PURCHASE ) ).to.be.false;
		} );

		test( 'should not be removable when domain mapping purchase is not expired', () => {
			expect( isRemovable( DOMAIN_MAPPING_PURCHASE ) ).to.be.false;
		} );

		test( 'should not be removable when site redirect purchase is not expired', () => {
			expect( isRemovable( SITE_REDIRECT_PURCHASE ) ).to.be.false;
		} );

		test( 'should be removable when domain registration purchase is expired', () => {
			expect( isRemovable( DOMAIN_PURCHASE_EXPIRED ) ).to.be.true;
		} );

		test( 'should be removable when domain mapping purchase is expired', () => {
			expect( isRemovable( DOMAIN_MAPPING_PURCHASE_EXPIRED ) ).to.be.true;
		} );

		test( 'should be removable when site redirect purchase is expired', () => {
			expect( isRemovable( SITE_REDIRECT_PURCHASE_EXPIRED ) ).to.be.true;
		} );
	} );
	describe( '#isCancelable', () => {
		test( 'should not be cancelable when the purchase is included in a plan', () => {
			expect( isCancelable( DOMAIN_PURCHASE_INCLUDED_IN_PLAN ) ).to.be.false;
		} );

		test( 'should not be cancelable when the purchase is expired', () => {
			expect( isCancelable( DOMAIN_PURCHASE_EXPIRED ) ).to.be.false;
		} );

		test( 'should be cancelable when the purchase is refundable', () => {
			expect( isCancelable( DOMAIN_PURCHASE ) ).to.be.true;
		} );

		test( 'should be cancelable when the purchase can have auto-renew disabled', () => {
			expect( isCancelable( PLAN_PURCHASE ) ).to.be.true;
		} );

		test( 'should not be cancelable if domain is pending transfer', () => {
			expect( isCancelable( DOMAIN_PURCHASE_PENDING_TRANSFER ) ).to.be.false;
		} );
	} );
	describe( '#isPaidWithCredits', () => {
		test( 'should be true when paid with credits', () => {
			expect( isPaidWithCredits( PLAN_PURCHASE_WITH_CREDITS ) ).to.be.true;
		} );
		test( 'should false when not paid with credits', () => {
			expect( isPaidWithCredits( PLAN_PURCHASE_WITH_PAYPAL ) ).to.be.false;
		} );
		test( 'should be false when payment not set on purchase', () => {
			expect( isPaidWithCredits( {} ) ).to.be.false;
		} );
	} );
	describe( '#subscribedWithinPastWeek', () => {
		test( 'should return false when no subscribed date', () => {
			expect( subscribedWithinPastWeek( {} ) ).to.be.false;
		} );
		test( 'should return false when subscribed more than 1 week ago', () => {
			expect(
				subscribedWithinPastWeek( {
					subscribedDate: moment()
						.subtract( 8, 'days' )
						.format(),
				} )
			).to.be.false;
		} );
		test( 'should return true when subscribed less than 1 week ago', () => {
			expect(
				subscribedWithinPastWeek( {
					subscribedDate: moment()
						.subtract( 3, 'days' )
						.format(),
				} )
			).to.be.true;
		} );
	} );
} );
