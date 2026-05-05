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
} );
