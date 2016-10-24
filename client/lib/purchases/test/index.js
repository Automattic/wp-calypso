/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	DOMAIN_PURCHASE,
	DOMAIN_PURCHASE_EXPIRED,
	DOMAIN_PURCHASE_INCLUDED_IN_PLAN,
	DOMAIN_MAPPING_PURCHASE,
	DOMAIN_MAPPING_PURCHASE_EXPIRED,
	PLAN_PURCHASE,
	SITE_REDIRECT_PURCHASE,
	SITE_REDIRECT_PURCHASE_EXPIRED
} from './data';
import { isRemovable, isCancelable } from '../index';

describe( 'index', () => {
	describe( '#isRemovable', () => {
		it( 'should not be removable when domain registration purchase is not expired', () => {
			expect( isRemovable( DOMAIN_PURCHASE ) ).to.be.false;
		} );

		it( 'should not be removable when domain mapping purchase is not expired', () => {
			expect( isRemovable( DOMAIN_MAPPING_PURCHASE ) ).to.be.false;
		} );

		it( 'should not be removable when site redirect purchase is not expired', () => {
			expect( isRemovable( SITE_REDIRECT_PURCHASE ) ).to.be.false;
		} );

		it( 'should be removable when domain registration purchase is expired', () => {
			expect( isRemovable( DOMAIN_PURCHASE_EXPIRED ) ).to.be.true;
		} );

		it( 'should be removable when domain mapping purchase is expired', () => {
			expect( isRemovable( DOMAIN_MAPPING_PURCHASE_EXPIRED ) ).to.be.true;
		} );

		it( 'should be removable when site redirect purchase is expired', () => {
			expect( isRemovable( SITE_REDIRECT_PURCHASE_EXPIRED ) ).to.be.true;
		} );
	} );
	describe( '#isCancelable', () => {
		it( 'should not be cancelable when the purchase is included in a plan', () => {
			expect( isCancelable( DOMAIN_PURCHASE_INCLUDED_IN_PLAN ) ).to.be.false;
		} );

		it( 'should not be cancelable when the purchase is expired', () => {
			expect( isCancelable( DOMAIN_PURCHASE_EXPIRED ) ).to.be.false;
		} );

		it( 'should be cancelable when the purchase is refundable', () => {
			expect( isCancelable( DOMAIN_PURCHASE ) ).to.be.true;
		} );

		it( 'should be cancelable when the purchase can have auto-renew disabled', () => {
			expect( isCancelable( PLAN_PURCHASE ) ).to.be.true;
		} );
	} );
} );
