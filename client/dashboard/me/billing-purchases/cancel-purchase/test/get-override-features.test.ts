/**
 * @jest-environment jsdom
 */
jest.mock( '@automattic/api-core', () => ( {
	GoogleWorkspaceSlugs: {
		GSUITE_BASIC_SLUG: 'gsuite-basic',
		GSUITE_BUSINESS_SLUG: 'gsuite-business',
	},
	AkismetPlans: {
		PRODUCT_AKISMET_PLUS_YEARLY: 'ak_plus_yearly_1',
	},
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

	describe( 'Jetpack products', () => {
		it( 'jetpack_security_t1_yearly → returns 7 features', () => {
			const purchase = makePurchase( {
				is_jetpack_plan_or_product: true,
				product_slug: 'jetpack_security_t1_yearly',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 7 );
		} );

		it( 'jetpack_security_t2_monthly → returns 7 features (different tier)', () => {
			const purchase = makePurchase( {
				is_jetpack_plan_or_product: true,
				product_slug: 'jetpack_security_t2_monthly',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 7 );
		} );

		it( 'jetpack_growth_yearly → returns 7 features', () => {
			const purchase = makePurchase( {
				is_jetpack_plan_or_product: true,
				product_slug: 'jetpack_growth_yearly',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 7 );
		} );

		it( 'jetpack_complete → returns 8 features', () => {
			const purchase = makePurchase( {
				is_jetpack_plan_or_product: true,
				product_slug: 'jetpack_complete',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 8 );
		} );

		it( 'jetpack_complete_bi_yearly → returns 8 features (billing period variant)', () => {
			const purchase = makePurchase( {
				is_jetpack_plan_or_product: true,
				product_slug: 'jetpack_complete_bi_yearly',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 8 );
		} );

		it( 'jetpack_ai_yearly → returns 5 features', () => {
			const purchase = makePurchase( {
				is_jetpack_plan_or_product: true,
				product_slug: 'jetpack_ai_yearly',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 5 );
		} );

		it( 'jetpack_ai_monthly_100 → returns 5 features (quantity variant)', () => {
			const purchase = makePurchase( {
				is_jetpack_plan_or_product: true,
				product_slug: 'jetpack_ai_monthly_100',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 5 );
		} );

		it( 'jetpack_backup_t1_yearly → returns 6 features', () => {
			const purchase = makePurchase( {
				is_jetpack_plan_or_product: true,
				product_slug: 'jetpack_backup_t1_yearly',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 6 );
		} );

		it( 'jetpack_backup_addon_storage_10gb_yearly → returns null (excluded)', () => {
			const purchase = makePurchase( {
				is_jetpack_plan_or_product: true,
				product_slug: 'jetpack_backup_addon_storage_10gb_yearly',
			} );
			expect( getOverrideCancellationFeatures( purchase ) ).toBeNull();
		} );

		it( 'jetpack_boost_yearly → returns 6 features', () => {
			const purchase = makePurchase( {
				is_jetpack_plan_or_product: true,
				product_slug: 'jetpack_boost_yearly',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 6 );
		} );

		it( 'jetpack_scan → returns 5 features', () => {
			const purchase = makePurchase( {
				is_jetpack_plan_or_product: true,
				product_slug: 'jetpack_scan',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 5 );
		} );

		it( 'jetpack_social_basic_yearly → returns 6 features', () => {
			const purchase = makePurchase( {
				is_jetpack_plan_or_product: true,
				product_slug: 'jetpack_social_basic_yearly',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 6 );
		} );

		it( 'jetpack_social_advanced_monthly → returns 6 features', () => {
			const purchase = makePurchase( {
				is_jetpack_plan_or_product: true,
				product_slug: 'jetpack_social_advanced_monthly',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 6 );
		} );

		it( 'jetpack_search → returns 5 features', () => {
			const purchase = makePurchase( {
				is_jetpack_plan_or_product: true,
				product_slug: 'jetpack_search',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 5 );
		} );

		it( 'jetpack_search_free → returns null (free excluded)', () => {
			const purchase = makePurchase( {
				is_jetpack_plan_or_product: true,
				product_slug: 'jetpack_search_free',
			} );
			expect( getOverrideCancellationFeatures( purchase ) ).toBeNull();
		} );

		it( 'jetpack_videopress → returns 6 features', () => {
			const purchase = makePurchase( {
				is_jetpack_plan_or_product: true,
				product_slug: 'jetpack_videopress',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 6 );
		} );

		it( 'jetpack_stats_monthly → returns 5 features', () => {
			const purchase = makePurchase( {
				is_jetpack_plan_or_product: true,
				product_slug: 'jetpack_stats_monthly',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 5 );
		} );

		it( 'jetpack_stats_free → returns null (free excluded)', () => {
			const purchase = makePurchase( {
				is_jetpack_plan_or_product: true,
				product_slug: 'jetpack_stats_free',
			} );
			expect( getOverrideCancellationFeatures( purchase ) ).toBeNull();
		} );

		it( 'jetpack_anti_spam → returns 4 features', () => {
			const purchase = makePurchase( {
				is_jetpack_plan_or_product: true,
				product_slug: 'jetpack_anti_spam',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 4 );
		} );

		it( 'jetpack_anti_spam_monthly_v2 → returns 4 features', () => {
			const purchase = makePurchase( {
				is_jetpack_plan_or_product: true,
				product_slug: 'jetpack_anti_spam_monthly_v2',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 4 );
		} );

		it( 'jetpack_crm → returns null (no override, RSM-826)', () => {
			const purchase = makePurchase( {
				is_jetpack_plan_or_product: true,
				product_slug: 'jetpack_crm',
			} );
			expect( getOverrideCancellationFeatures( purchase ) ).toBeNull();
		} );

		it( 'routes Jetpack products that also have is_plan=true correctly', () => {
			const purchase = makePurchase( {
				is_plan: true,
				is_jetpack_plan_or_product: true,
				product_slug: 'jetpack_security_t1_yearly',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 7 );
		} );
	} );

	describe( 'Akismet', () => {
		it( 'returns 4 features for an Akismet plan', () => {
			const purchase = makePurchase( {
				product_slug: 'ak_plus_yearly_1',
				product_name: 'Akismet Plus',
			} );
			const result = getOverrideCancellationFeatures( purchase );
			expect( result ).toHaveLength( 4 );
		} );
	} );
} );
