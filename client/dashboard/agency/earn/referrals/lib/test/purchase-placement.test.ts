import {
	canPlacePurchase,
	isCancelledButActive,
	isWpcomHostingPurchase,
} from '../purchase-placement';
import type { ReferralPurchase } from '@automattic/api-core';

function createPurchase( overrides: Partial< ReferralPurchase > = {} ): ReferralPurchase {
	return {
		status: 'active',
		product_id: 2014,
		quantity: 1,
		site_assigned: '',
		referral_id: 1,
		license: {
			license_key: 'jetpack-complete_abc123',
			issued_at: '2026-01-01 00:00:00',
			attached_at: null,
			revoked_at: null,
		},
		...overrides,
	};
}

describe( 'canPlacePurchase', () => {
	test( 'allows a paid license that has not been put on a site', () => {
		expect( canPlacePurchase( createPurchase() ) ).toBe( true );
	} );

	test( 'rejects a purchase the client has not paid for', () => {
		expect( canPlacePurchase( createPurchase( { status: 'pending' } ) ) ).toBe( false );
	} );

	test( 'rejects a purchase that already has a site', () => {
		expect( canPlacePurchase( createPurchase( { site_assigned: 'example.com' } ) ) ).toBe( false );
	} );

	test( 'rejects Pressable, which is managed in Pressable', () => {
		const purchase = createPurchase( {
			license: {
				license_key: 'pressable-build_abc123',
				issued_at: '2026-01-01 00:00:00',
				attached_at: null,
				revoked_at: null,
			},
		} );
		expect( canPlacePurchase( purchase ) ).toBe( false );
	} );

	test( 'rejects a purchase with no license yet', () => {
		const purchase = createPurchase( {
			license: {
				license_key: '',
				issued_at: '',
				attached_at: null,
				revoked_at: null,
			},
		} );
		expect( canPlacePurchase( purchase ) ).toBe( false );
	} );
} );

describe( 'isWpcomHostingPurchase', () => {
	test( 'recognises a WordPress.com hosting license', () => {
		const purchase = createPurchase( {
			license: {
				license_key: 'wpcom-hosting-business_abc123',
				issued_at: '2026-01-01 00:00:00',
				attached_at: null,
				revoked_at: null,
			},
		} );
		expect( isWpcomHostingPurchase( purchase ) ).toBe( true );
	} );

	test( 'does not match other products', () => {
		expect( isWpcomHostingPurchase( createPurchase() ) ).toBe( false );
	} );
} );

describe( 'isCancelledButActive', () => {
	const subscription = {
		id: 'sub-1',
		product_name: 'Jetpack Complete',
		status: 'active',
		is_auto_renew_enabled: false,
		expiry: '2026-12-01',
	};

	test( 'matches an active subscription that will not renew', () => {
		expect( isCancelledButActive( createPurchase( { subscription } ) ) ).toBe( true );
	} );

	test( 'ignores a subscription that still renews', () => {
		const renewing = { ...subscription, is_auto_renew_enabled: true };
		expect( isCancelledButActive( createPurchase( { subscription: renewing } ) ) ).toBe( false );
	} );

	test( 'ignores a subscription that has already lapsed', () => {
		const lapsed = { ...subscription, status: 'canceled' };
		expect( isCancelledButActive( createPurchase( { subscription: lapsed } ) ) ).toBe( false );
	} );

	test( 'ignores a purchase with no subscription', () => {
		expect( isCancelledButActive( createPurchase() ) ).toBe( false );
	} );
} );
