/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { default as isProductConflictingWithSite, isAntiSpamConflicting } from '../conflicts';
import {
	PRODUCT_JETPACK_ANTI_SPAM,
	PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
} from 'calypso/lib/products-values/constants';
import { PLAN_JETPACK_FREE, PLAN_JETPACK_PERSONAL } from 'calypso/lib/plans/constants';

/**
 * Type dependencies
 */
import type { AppState } from 'calypso/types';

describe( 'conflicts', () => {
	const getStateForSite = ( {
		productSlug = '',
		plan = PLAN_JETPACK_FREE,
		jetpack = true,
		atomic = false,
	} = {} ): AppState => ( {
		sites: {
			plans: {
				1234: {
					data: [
						{
							currentPlan: true,
							productSlug: plan,
						},
					],
				},
			},
			items: {
				1234: {
					jetpack,
					options: {
						is_automated_transfer: atomic,
					},
					products: [ { product_slug: productSlug } ],
				},
			},
		},
		ui: {
			selectedSiteId: null,
		},
	} );
	describe( '#isProductConflictingWithSite()', () => {
		test( 'should return null for a null siteId', () => {
			const isProductConflicting = isProductConflictingWithSite(
				{},
				null,
				PRODUCT_JETPACK_ANTI_SPAM
			);
			expect( isProductConflicting ).to.be.null;
		} );

		test( 'should return null for a test product', () => {
			const isProductConflicting = isProductConflictingWithSite( {}, 1234, 'test' );
			expect( isProductConflicting ).to.be.null;
		} );

		test( 'should return true when testing for Anti-spam annual', () => {
			const isProductConflicting = isProductConflictingWithSite(
				getStateForSite( { productSlug: PRODUCT_JETPACK_ANTI_SPAM } ),
				1234,
				PRODUCT_JETPACK_ANTI_SPAM
			);
			expect( isProductConflicting ).to.be.true;
		} );

		test( 'should return true when testing for Anti-spam monthly', () => {
			const isProductConflicting = isProductConflictingWithSite(
				getStateForSite( { productSlug: PRODUCT_JETPACK_ANTI_SPAM_MONTHLY } ),
				1234,
				PRODUCT_JETPACK_ANTI_SPAM_MONTHLY
			);
			expect( isProductConflicting ).to.be.true;
		} );
	} );

	describe( '#isAntiSpamConflicting', () => {
		test( 'should return true when the site has a plan with anti-spam', () => {
			const state = getStateForSite( { plan: PLAN_JETPACK_PERSONAL } );
			const isConflicting = isAntiSpamConflicting( state, 1234 );
			expect( isConflicting ).to.be.true;
		} );

		test( 'should return true when the site is not Jetpack', () => {
			const isConflicting = isAntiSpamConflicting( getStateForSite( { jetpack: false } ), 1234 );
			expect( isConflicting ).to.be.true;
		} );

		test( 'should return true when the site is Atomic', () => {
			const isConflicting = isAntiSpamConflicting( getStateForSite( { atomic: true } ), 1234 );
			expect( isConflicting ).to.be.true;
		} );

		test( 'should return true when the site already has Anti-spam', () => {
			const isConflicting = isAntiSpamConflicting(
				getStateForSite( { productSlug: PRODUCT_JETPACK_ANTI_SPAM_MONTHLY } ),
				1234
			);
			expect( isConflicting ).to.be.true;
		} );

		test( 'should return false when the site satisfies the other conditions', () => {
			const isConflicting = isAntiSpamConflicting( getStateForSite(), 1234 );
			expect( isConflicting ).to.be.false;
		} );
	} );
} );
