/**
 * @jest-environment jsdom
 */

import { JetpackPlans, SubscriptionBillPeriod, type Purchase } from '@automattic/api-core';
import {
	getSitePurchaseStorageUpgradeUrl,
	getSitePurchaseUpgradeUrl,
	getWpcomPlanChangeTarget,
	getWpcomPlanChangeUrl,
} from '../site-url';

function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		product_slug: 'jetpack_backup_t1_yearly',
		site_slug: 'example.com',
		is_jetpack_backup_t1: true,
		is_jetpack_plan_or_product: true,
		...overrides,
	} as Purchase;
}

// Shaped like the real callers': no success-notice param, since
// getWpcomPlanChangeUrl adds one, and carrying the `:purchaseId` placeholder that
// checkout substitutes afterwards.
const REDIRECT_TO = '/me/billing/purchases/:purchaseId';
const CANCEL_TO = '/me/billing/purchases/1';

function makeDotcomPlan( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		product_slug: 'personal-bundle',
		site_slug: 'example.com',
		is_plan: true,
		is_upgradable: true,
		is_jetpack_plan_or_product: false,
		is_plan_type_downgradable: false,
		is_trial_plan: false,
		is_woo_hosted_product: false,
		bill_period_days: SubscriptionBillPeriod.PLAN_ANNUAL_PERIOD,
		...overrides,
	} as Purchase;
}

function changeUrl( purchase: Purchase, upgradeOnly = false ) {
	return getWpcomPlanChangeUrl( purchase, {
		cancelTo: CANCEL_TO,
		redirectTo: REDIRECT_TO,
		upgradeOnly,
	} );
}

function changeTarget( purchase: Purchase, upgradeOnly = false ) {
	return getWpcomPlanChangeTarget( purchase, {
		cancelTo: CANCEL_TO,
		redirectTo: REDIRECT_TO,
		upgradeOnly,
	} );
}

describe( 'getSitePurchaseStorageUpgradeUrl', () => {
	test( 'links a Backup T1 product to the storage upgrade page', () => {
		expect( getSitePurchaseStorageUpgradeUrl( makePurchase() ) ).toContain(
			'/plans/storage/example.com'
		);
	} );

	test( 'links a Security T1 plan to the storage upgrade page', () => {
		expect(
			getSitePurchaseStorageUpgradeUrl(
				makePurchase( {
					product_slug: JetpackPlans.PLAN_JETPACK_SECURITY_T1_YEARLY,
					is_jetpack_backup_t1: false,
				} )
			)
		).toContain( '/plans/storage/example.com' );
	} );

	test( 'returns undefined for a product that is not storage-eligible', () => {
		expect(
			getSitePurchaseStorageUpgradeUrl(
				makePurchase( { product_slug: 'business-bundle', is_jetpack_backup_t1: false } )
			)
		).toBeUndefined();
	} );
} );

describe( 'getSitePurchaseUpgradeUrl', () => {
	test( 'routes a storage-eligible product to the plan upgrade page, not the storage page', () => {
		const url = getSitePurchaseUpgradeUrl( makePurchase() );
		expect( url ).not.toContain( '/plans/storage' );
		expect( url ).toContain( '/plans/example.com' );
	} );
} );

describe( 'getWpcomPlanChangeUrl', () => {
	test( 'offers downgrades for a downgradable plan', () => {
		const url = changeUrl( makeDotcomPlan( { is_plan_type_downgradable: true } ) );
		expect( url ).toContain( '/setup/plan-upgrade' );
		expect( url ).toContain( 'allow_downgrade=true' );
	} );

	test( 'omits the downgrade flag for a plan with nothing below it', () => {
		const url = changeUrl( makeDotcomPlan() );
		expect( url ).toContain( '/setup/plan-upgrade' );
		expect( url ).not.toContain( 'allow_downgrade' );
	} );

	test( 'still returns a URL for an expired plan that cannot be downgraded', () => {
		const url = changeUrl(
			makeDotcomPlan( {
				expiry_status: 'expired',
				subscription_status: 'active',
				is_past_expiry_date: true,
			} )
		);
		expect( url ).toContain( '/setup/plan-upgrade' );
	} );

	test( 'upgradeOnly suppresses downgrades that would otherwise be offered', () => {
		const purchase = makeDotcomPlan( { is_plan_type_downgradable: true } );
		expect( changeUrl( purchase ) ).toContain( 'allow_downgrade=true' );
		expect( changeUrl( purchase, true ) ).not.toContain( 'allow_downgrade' );
	} );

	test( 'upgradeOnly cannot manufacture a downgrade link', () => {
		expect( changeUrl( makeDotcomPlan(), false ) ).not.toContain( 'allow_downgrade' );
		expect( changeUrl( makeDotcomPlan(), true ) ).not.toContain( 'allow_downgrade' );
	} );

	test( 'carries the caller-supplied redirectTo and cancelTo', () => {
		const url = changeUrl( makeDotcomPlan( { is_plan_type_downgradable: true } ) ) as string;
		expect( decodeURIComponent( url ) ).toContain( REDIRECT_TO );
		expect( decodeURIComponent( url ) ).toContain( CANCEL_TO );
	} );

	test( 'tags the redirect with the notice matching the grid it opened', () => {
		const downgradable = decodeURIComponent(
			changeUrl( makeDotcomPlan( { is_plan_type_downgradable: true } ) ) as string
		);
		expect( downgradable ).toContain( 'plan_changed=true' );
		expect( downgradable ).not.toContain( 'upgraded=true' );

		const upgradeOnly = decodeURIComponent( changeUrl( makeDotcomPlan() ) as string );
		expect( upgradeOnly ).toContain( 'upgraded=true' );
		expect( upgradeOnly ).not.toContain( 'plan_changed=true' );
	} );

	test( 'tags the redirect as upgrade-only when upgradeOnly suppresses downgrades', () => {
		const url = decodeURIComponent(
			changeUrl( makeDotcomPlan( { is_plan_type_downgradable: true } ), true ) as string
		);
		expect( url ).toContain( 'upgraded=true' );
		expect( url ).not.toContain( 'plan_changed=true' );
	} );

	test( 'derives intervalType from the billing term', () => {
		const url = changeUrl(
			makeDotcomPlan( {
				is_plan_type_downgradable: true,
				bill_period_days: SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD,
			} )
		);
		expect( url ).toContain( 'intervalType=monthly' );
	} );

	test( 'sends a trial to the plans page rather than the stepper flow', () => {
		const url = changeUrl( makeDotcomPlan( { is_trial_plan: true } ) );
		expect( url ).toContain( '/plans/example.com' );
		expect( url ).not.toContain( '/setup/plan-upgrade' );
	} );

	test( 'sends a Woo-hosted plan to the Woo plans flow', () => {
		const url = changeUrl( makeDotcomPlan( { is_woo_hosted_product: true } ) );
		expect( url ).toContain( '/setup/woo-hosted-plans' );
	} );

	test( 'returns undefined for anything that is not a WordPress.com plan', () => {
		expect( changeUrl( makePurchase() ) ).toBeUndefined();
		expect( changeUrl( makeDotcomPlan( { is_plan: false } ) ) ).toBeUndefined();
		expect( changeUrl( makeDotcomPlan( { is_jetpack_plan_or_product: true } ) ) ).toBeUndefined();
	} );

	test( 'returns undefined for a plan that can be neither upgraded nor downgraded', () => {
		expect( changeUrl( makeDotcomPlan( { is_upgradable: false } ) ) ).toBeUndefined();
	} );
} );

describe( 'getWpcomPlanChangeTarget', () => {
	test( 'reports whether the destination offers downgrades', () => {
		expect( changeTarget( makeDotcomPlan() )?.offersDowngrades ).toBe( false );
		expect(
			changeTarget( makeDotcomPlan( { is_plan_type_downgradable: true } ) )?.offersDowngrades
		).toBe( true );
	} );

	test( 'still offers a target for a top tier plan, which can only be downgraded', () => {
		const target = changeTarget(
			makeDotcomPlan( { is_upgradable: false, is_plan_type_downgradable: true } )
		);
		expect( target?.href ).toContain( 'allow_downgrade=true' );
		expect( target?.offersDowngrades ).toBe( true );
	} );

	test( 'reports no downgrades once upgradeOnly suppresses them', () => {
		expect(
			changeTarget( makeDotcomPlan( { is_plan_type_downgradable: true } ), true )?.offersDowngrades
		).toBe( false );
	} );

	// Suppressing downgrades leaves a top tier plan with nowhere to go.
	test( 'returns undefined when upgradeOnly suppresses the only available change', () => {
		expect(
			changeTarget(
				makeDotcomPlan( { is_upgradable: false, is_plan_type_downgradable: true } ),
				true
			)
		).toBeUndefined();
	} );
} );
