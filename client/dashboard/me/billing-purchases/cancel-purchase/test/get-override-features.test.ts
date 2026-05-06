/**
 * @jest-environment jsdom
 */
jest.mock( '@automattic/api-core', () => ( {
	GoogleWorkspaceSlugs: {
		GSUITE_BASIC_SLUG: 'gsuite-basic',
		GSUITE_BUSINESS_SLUG: 'gsuite-business',
	},
	AkismetPlans: {},
	TitanMailSlugs: {
		TITAN_MAIL_MONTHLY_SLUG: 'titan-mail-monthly',
		TITAN_MAIL_YEARLY_SLUG: 'titan-mail-yearly',
	},
} ) );

import { getOverrideCancellationFeatures } from '../get-override-features';
import type { PurchaseForCopy } from '../get-confirmation-copy';

function makePurchase( overrides: Partial< PurchaseForCopy > = {} ): PurchaseForCopy {
	return {
		is_plan: false,
		is_domain_registration: false,
		is_jetpack_plan_or_product: false,
		product_slug: 'test-product',
		product_name: 'Test Product',
		product_type: 'other',
		expiry_date: '2027-04-16',
		expiry_status: 'manual-renew',
		domain: 'example.com',
		...overrides,
	} as PurchaseForCopy;
}

describe( 'getOverrideCancellationFeatures', () => {
	it( 'returns null for a plan purchase (no entries yet)', () => {
		const purchase = makePurchase( {
			is_plan: true,
			product_slug: 'business-bundle',
			product_name: 'WordPress.com Business',
		} );
		expect( getOverrideCancellationFeatures( purchase ) ).toBeNull();
	} );

	it( 'returns null for a domain purchase', () => {
		const purchase = makePurchase( {
			is_domain_registration: true,
			product_slug: 'dotcom_domain',
			product_name: 'example.com',
		} );
		expect( getOverrideCancellationFeatures( purchase ) ).toBeNull();
	} );

	it( 'returns null for a Jetpack purchase', () => {
		const purchase = makePurchase( {
			is_jetpack_plan_or_product: true,
			product_slug: 'jetpack_security_daily',
			product_name: 'Jetpack Security',
		} );
		expect( getOverrideCancellationFeatures( purchase ) ).toBeNull();
	} );

	describe( 'marketplace and add-on products', () => {
		it( 'returns 4 features for a marketplace plugin', () => {
			const purchase = makePurchase( {
				product_type: 'marketplace_plugin',
				product_slug: 'some-marketplace-plugin',
				product_name: 'SEO Plugin',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 4 );
			expect( result![ 0 ].title ).toContain( 'plugin' );
		} );

		it( 'returns 4 features for a SaaS plugin', () => {
			const purchase = makePurchase( {
				product_type: 'saas_plugin',
				product_slug: 'some-saas-plugin',
				product_name: 'SaaS Plugin',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 4 );
			expect( result![ 0 ].title ).toContain( 'plugin' );
		} );

		it( 'returns 4 features for a marketplace theme', () => {
			const purchase = makePurchase( {
				product_type: 'marketplace_theme',
				product_slug: 'some-marketplace-theme',
				product_name: 'Premium Theme',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 4 );
			expect( result![ 0 ].title ).toContain( 'theme' );
		} );

		it( 'returns 4 features for the premium theme add-on (unlimited_themes)', () => {
			const purchase = makePurchase( {
				product_slug: 'unlimited_themes',
				product_name: 'Premium Themes',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 4 );
			expect( result![ 0 ].title ).toContain( 'premium theme' );
		} );

		it( 'returns 3 features for a storage add-on (50gb)', () => {
			const purchase = makePurchase( {
				product_slug: '50gb_space_upgrade',
				product_name: '50 GB Storage',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 3 );
			expect( result![ 0 ].title ).toContain( 'storage' );
		} );

		it( 'returns 3 features for a storage add-on (other tier)', () => {
			const purchase = makePurchase( {
				product_slug: '1gb_space_upgrade',
				product_name: '1 GB Storage',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 3 );
			expect( result![ 0 ].title ).toContain( 'storage' );
		} );

		it( 'returns 3 features for the tiered-volume storage add-on', () => {
			const purchase = makePurchase( {
				product_slug: 'wordpress_com_1gb_space_addon_yearly',
				product_name: 'Storage Add-On Space Upgrade 50 GB',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 3 );
			expect( result![ 0 ].title ).toContain( 'storage' );
		} );

		it( 'returns 3 features for the CSS add-on (custom-design)', () => {
			const purchase = makePurchase( {
				product_slug: 'custom-design',
				product_name: 'Custom Design',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 3 );
			expect( result![ 0 ].title ).toContain( 'CSS' );
		} );

		it( 'returns null for an unknown other product', () => {
			const purchase = makePurchase( {
				product_slug: 'unknown-addon',
				product_name: 'Unknown Add-on',
			} );
			expect( getOverrideCancellationFeatures( purchase ) ).toBeNull();
		} );
	} );
} );
