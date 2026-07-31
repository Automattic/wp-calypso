/**
 * @jest-environment jsdom
 */

import { getPlanChangeAction } from '../get-plan-change-action';
import type { Purchase } from '@automattic/api-core';

const URLS = {
	cancelTo: '/me/billing/purchases/1',
	redirectTo: '/me/billing/purchases/:purchaseId',
};

function makePlan( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		product_slug: 'personal-bundle',
		site_slug: 'example.com',
		is_plan: true,
		is_upgradable: true,
		is_jetpack_plan_or_product: false,
		is_plan_type_downgradable: false,
		is_trial_plan: false,
		is_woo_hosted_product: false,
		expiry_status: 'active',
		subscription_status: 'active',
		...overrides,
	} as Purchase;
}

function action( purchase: Purchase, upgradeOnly = false ) {
	return getPlanChangeAction( purchase, { ...URLS, upgradeOnly } );
}

describe( 'getPlanChangeAction', () => {
	test( 'offers "Change plan" for a downgradable plan', () => {
		const result = action( makePlan( { is_plan_type_downgradable: true } ) );
		expect( result?.title ).toBe( 'Change plan' );
		expect( result?.offersDowngrades ).toBe( true );
		expect( result?.href ).toContain( 'allow_downgrade=true' );
	} );

	test( 'offers "Upgrade plan" for a plan with nothing below it', () => {
		const result = action( makePlan() );
		expect( result?.title ).toBe( 'Upgrade plan' );
		expect( result?.offersDowngrades ).toBe( false );
		expect( result?.href ).not.toContain( 'allow_downgrade' );
	} );

	test( 'renders for an expired plan that cannot be downgraded', () => {
		expect(
			action(
				makePlan( {
					expiry_status: 'expired',
					subscription_status: 'active',
					is_past_expiry_date: true,
				} )
			)
		).not.toBeNull();
	} );

	test( 'offers "Upgrade plan" for a removed plan, since the site is back on free', () => {
		const result = action( makePlan( { subscription_status: 'inactive' } ) );
		expect( result?.title ).toBe( 'Upgrade plan' );
		expect( result?.href ).not.toContain( 'allow_downgrade' );
	} );

	test( 'offers "Change plan" for a top-tier plan that can only be downgraded', () => {
		const topTier = makePlan( { is_upgradable: false, is_plan_type_downgradable: true } );
		const result = action( topTier );
		expect( result?.title ).toBe( 'Change plan' );
		expect( result?.href ).toContain( 'allow_downgrade=true' );
	} );

	test( 'offers nothing to a top-tier plan when the caller wants upgrades only', () => {
		const topTier = makePlan( { is_upgradable: false, is_plan_type_downgradable: true } );
		expect( action( topTier, true ) ).toBeNull();
	} );

	test( 'pairs each destination with its own post-checkout redirect', () => {
		const changed = action( makePlan( { is_plan_type_downgradable: true } ) );
		expect( decodeURIComponent( changed?.href ?? '' ) ).toContain( 'plan_changed=true' );

		const upgraded = action( makePlan() );
		expect( decodeURIComponent( upgraded?.href ?? '' ) ).toContain( 'upgraded=true' );
	} );

	describe( 'upgradeOnly', () => {
		test( 'forces the label and the URL to upgrade-only together', () => {
			const result = action( makePlan( { is_plan_type_downgradable: true } ), true );
			expect( result?.title ).toBe( 'Upgrade plan' );
			expect( result?.offersDowngrades ).toBe( false );
			expect( result?.href ).not.toContain( 'allow_downgrade' );
		} );

		test( 'can only subtract — it never manufactures a downgrade link', () => {
			const notDowngradable = makePlan();
			expect( action( notDowngradable, false )?.href ).not.toContain( 'allow_downgrade' );
			expect( action( notDowngradable, true )?.href ).not.toContain( 'allow_downgrade' );
		} );
	} );

	describe( 'returns null', () => {
		test( 'when the plan is not upgradable', () => {
			expect( action( makePlan( { is_upgradable: false } ) ) ).toBeNull();
		} );

		test( 'for a Jetpack plan', () => {
			expect( action( makePlan( { is_jetpack_plan_or_product: true } ) ) ).toBeNull();
		} );

		test( 'for a non-plan product', () => {
			expect( action( makePlan( { is_plan: false } ) ) ).toBeNull();
		} );
	} );
} );
