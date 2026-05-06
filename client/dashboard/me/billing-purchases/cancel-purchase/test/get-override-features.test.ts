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
		site_slug: 'example.com',
		...overrides,
	} as PurchaseForCopy;
}

describe( 'getOverrideCancellationFeatures', () => {
	describe( 'WordPress.com plans', () => {
		it( 'returns 7 features for personal-bundle', () => {
			const purchase = makePurchase( {
				is_plan: true,
				product_slug: 'personal-bundle',
				product_name: 'WordPress.com Personal',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 7 );
			expect( result![ 0 ].title ).toBe( 'example.com as your primary domain' );
		} );

		it( 'returns 6 features for personal-bundle-monthly (omits support)', () => {
			const purchase = makePurchase( {
				is_plan: true,
				product_slug: 'personal-bundle-monthly',
				product_name: 'WordPress.com Personal',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 6 );
			expect( result!.every( ( f ) => ! f.title.includes( 'Support' ) ) ).toBe( true );
		} );

		it( 'returns 8 features for value_bundle', () => {
			const purchase = makePurchase( {
				is_plan: true,
				product_slug: 'value_bundle',
				product_name: 'WordPress.com Premium',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 8 );
			expect( result![ 0 ].title ).toBe( 'example.com as your primary domain' );
		} );

		it( 'returns 8 features for business-bundle', () => {
			const purchase = makePurchase( {
				is_plan: true,
				product_slug: 'business-bundle',
				product_name: 'WordPress.com Business',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 8 );
			expect( result![ 0 ].title ).toBe( 'example.com as your primary domain' );
		} );

		it( 'returns 8 features for ecommerce-bundle', () => {
			const purchase = makePurchase( {
				is_plan: true,
				product_slug: 'ecommerce-bundle',
				product_name: 'WordPress.com eCommerce',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 8 );
			expect( result![ 0 ].title ).toBe( 'example.com as your primary domain' );
		} );

		it( 'returns 7 features for ecommerce-trial-bundle-monthly (omits support)', () => {
			const purchase = makePurchase( {
				is_plan: true,
				product_slug: 'ecommerce-trial-bundle-monthly',
				product_name: 'WordPress.com eCommerce',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 7 );
			expect( result!.every( ( f ) => ! f.title.includes( 'support' ) ) ).toBe( true );
		} );

		it( 'shows custom domain name when site has a custom domain', () => {
			const purchase = makePurchase( {
				is_plan: true,
				product_slug: 'business-bundle',
				product_name: 'WordPress.com Business',
				site_slug: 'filippodt.com',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result![ 0 ].title ).toBe( 'filippodt.com as your primary domain' );
		} );

		it( 'falls back to generic domain copy for wordpress.com subdomain', () => {
			const purchase = makePurchase( {
				is_plan: true,
				product_slug: 'business-bundle',
				product_name: 'WordPress.com Business',
				site_slug: 'mysite.wordpress.com',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result![ 0 ].title ).toBe( 'Custom domain for your site' );
		} );

		it( 'falls back to generic domain copy for wpcomstaging.com subdomain', () => {
			const purchase = makePurchase( {
				is_plan: true,
				product_slug: 'business-bundle',
				product_name: 'WordPress.com Business',
				site_slug: 'mysite.wpcomstaging.com',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result![ 0 ].title ).toBe( 'Custom domain for your site' );
		} );

		it( 'returns null for an unknown plan slug', () => {
			const purchase = makePurchase( {
				is_plan: true,
				product_slug: 'unknown-plan-slug',
				product_name: 'Unknown Plan',
			} );
			expect( getOverrideCancellationFeatures( purchase ) ).toBeNull();
		} );
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
} );
