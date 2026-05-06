/**
 * @jest-environment jsdom
 */
jest.mock( '@automattic/api-core', () => ( {
	GoogleWorkspaceSlugs: {
		GSUITE_BASIC_SLUG: 'gapps',
		GSUITE_BUSINESS_SLUG: 'gapps_unlimited',
		GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY: 'wp_google_workspace_business_starter_monthly',
		GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY: 'wp_google_workspace_business_starter_yearly',
	},
	AkismetPlans: {},
	TitanMailSlugs: {
		TITAN_MAIL_MONTHLY_SLUG: 'wp_titan_mail_monthly',
		TITAN_MAIL_YEARLY_SLUG: 'wp_titan_mail_yearly',
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

	describe( 'domain and email products', () => {
		it( 'returns 5 features for a domain registration', () => {
			const purchase = makePurchase( {
				is_domain_registration: true,
				product_slug: 'dotcom_domain',
				product_name: 'example.com',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 5 );
			expect( result![ 0 ].title ).toContain( 'domain' );
		} );

		it( 'returns 6 features for Google Workspace (yearly)', () => {
			const purchase = makePurchase( {
				product_slug: 'wp_google_workspace_business_starter_yearly',
				product_name: 'Google Workspace',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 6 );
			expect( result![ 0 ].title ).toBe( 'Your custom email address' );
			expect( result![ 1 ].title ).toContain( 'Gmail' );
		} );

		it( 'returns 6 features for legacy G Suite (gapps)', () => {
			const purchase = makePurchase( {
				product_slug: 'gapps',
				product_name: 'G Suite',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 6 );
			expect( result![ 0 ].title ).toBe( 'Your custom email address' );
		} );

		it( 'returns 5 features for Professional Email (yearly)', () => {
			const purchase = makePurchase( {
				product_slug: 'wp_titan_mail_yearly',
				product_name: 'Professional Email',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 5 );
			expect( result![ 0 ].title ).toBe( 'Your custom email address' );
			expect( result![ 1 ].title ).toContain( 'mailbox' );
		} );

		it( 'returns 5 features for Professional Email (monthly)', () => {
			const purchase = makePurchase( {
				product_slug: 'wp_titan_mail_monthly',
				product_name: 'Professional Email',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 5 );
		} );
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
