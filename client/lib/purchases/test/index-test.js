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
	DOMAIN_MAPPING_PURCHASE,
	DOMAIN_MAPPING_PURCHASE_EXPIRED,
	SITE_REDIRECT_PURCHASE,
	SITE_REDIRECT_PURCHASE_EXPIRED
} from 'data';
import { isRemovable } from '../index';

describe( 'Purchases Utils', () => {
	describe( 'isRemovable', () => {
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
} );
