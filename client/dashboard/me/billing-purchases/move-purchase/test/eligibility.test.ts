import { canSiteReceivePurchase, isPurchaseMovableToAnotherSite } from '../eligibility';
import type { Purchase, Site } from '@automattic/api-core';

function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		ID: 1,
		user_id: 1,
		blog_id: 100,
		is_plan: true,
		is_jetpack_plan_or_product: false,
		is_domain: false,
		is_attached_to_holding_site: false,
		subscription_status: 'active',
		expiry_status: 'auto-renewing',
		...overrides,
	} as Purchase;
}

function makeSite( overrides: Partial< Site > = {} ): Site {
	return {
		ID: 200,
		slug: 'target.wordpress.com',
		jetpack: false,
		is_wpcom_atomic: false,
		is_wpcom_staging_site: false,
		is_vip: false,
		is_a4a_dev_site: false,
		plan: { is_free: true },
		...overrides,
	} as Site;
}

describe( 'isPurchaseMovableToAnotherSite', () => {
	test( 'allows active WordPress.com plans and domains', () => {
		expect( isPurchaseMovableToAnotherSite( makePurchase() ) ).toBe( true );
		expect(
			isPurchaseMovableToAnotherSite( makePurchase( { is_plan: false, is_domain: true } ) )
		).toBe( true );
	} );

	test.each( [
		[ 'Jetpack plans', { is_jetpack_plan_or_product: true } ],
		[ 'other products', { is_plan: false } ],
		[ 'removed purchases', { subscription_status: 'inactive' } ],
		[ 'holding-site purchases', { is_attached_to_holding_site: true } ],
		[ 'host-managed purchases', { is_host_managed: true } ],
		[ 'support-only purchases', { is_manageable_by_user: false } ],
		[ 'trials', { is_trial_plan: true } ],
	] as const )( 'rules out %s', ( _label, overrides ) => {
		expect(
			isPurchaseMovableToAnotherSite( makePurchase( overrides as Partial< Purchase > ) )
		).toBe( false );
	} );
} );

describe( 'canSiteReceivePurchase', () => {
	test( 'a plan can only go to a Simple site without a paid plan', () => {
		const purchase = makePurchase();
		expect( canSiteReceivePurchase( purchase, makeSite() ) ).toBe( true );
		expect(
			canSiteReceivePurchase(
				purchase,
				makeSite( { plan: { is_free: false } } as Partial< Site > )
			)
		).toBe( false );
		expect(
			canSiteReceivePurchase( purchase, makeSite( { is_wpcom_atomic: true, jetpack: true } ) )
		).toBe( false );
	} );

	test( 'a domain can go to sites with plans, including Atomic ones', () => {
		const purchase = makePurchase( { is_plan: false, is_domain: true } );
		expect(
			canSiteReceivePurchase(
				purchase,
				makeSite( { plan: { is_free: false } } as Partial< Site > )
			)
		).toBe( true );
		expect(
			canSiteReceivePurchase( purchase, makeSite( { is_wpcom_atomic: true, jetpack: true } ) )
		).toBe( true );
	} );

	test( 'never offers the source site, self-hosted Jetpack sites or staging sites', () => {
		const purchase = makePurchase( { is_plan: false, is_domain: true } );
		expect( canSiteReceivePurchase( purchase, makeSite( { ID: 100 } ) ) ).toBe( false );
		expect( canSiteReceivePurchase( purchase, makeSite( { jetpack: true } ) ) ).toBe( false );
		expect( canSiteReceivePurchase( purchase, makeSite( { is_wpcom_staging_site: true } ) ) ).toBe(
			false
		);
	} );
} );
