/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://my.localhost/me/billing/purchases/123/cancel?intent=remove"}
 */

import { SubscriptionBillPeriod, type Purchase } from '@automattic/api-core';
import { dashboardLink } from '../../../../utils/link';
import { getCancelFlowPlanChangeUrl } from '../get-cancel-flow-plan-change-url';

// Built with dashboardLink(), since the dev dashboard origin includes the configured port.
const CANCEL_TO = dashboardLink( '/me/billing/purchases/123/cancel?intent=remove' );
const REDIRECT_TO = dashboardLink( '/me/billing/purchases/:purchaseId' );

function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		ID: 123,
		product_slug: 'value_bundle',
		site_slug: 'example.wordpress.com',
		is_plan: true,
		is_upgradable: true,
		is_jetpack_plan_or_product: false,
		is_plan_type_downgradable: true,
		is_trial_plan: false,
		is_woo_hosted_product: false,
		bill_period_days: SubscriptionBillPeriod.PLAN_ANNUAL_PERIOD,
		...overrides,
	} as Purchase;
}

function parse( href: string ) {
	const url = new URL( href );
	return {
		page: url.origin + url.pathname,
		params: Object.fromEntries( url.searchParams ),
	};
}

describe( 'getCancelFlowPlanChangeUrl', () => {
	test( 'sends a downgradable plan to the plans page with allow_downgrade and the ref', () => {
		const { page, params } = parse( getCancelFlowPlanChangeUrl( makePurchase(), 'change-plan' ) );

		expect( page ).toBe( 'https://wordpress.com/setup/plan-upgrade' );
		expect( params ).toEqual( {
			siteSlug: 'example.wordpress.com',
			intervalType: 'yearly',
			cancel_to: CANCEL_TO,
			dashboard: 'dotcom',
			redirect_to: `${ REDIRECT_TO }?plan_changed=true`,
			allow_downgrade: 'true',
			ref: 'cancel-flow-change-plan',
		} );
	} );

	test( 'sends an upgrade-only plan to the plans page with the ref', () => {
		const { page, params } = parse(
			getCancelFlowPlanChangeUrl(
				makePurchase( { product_slug: 'personal-bundle', is_plan_type_downgradable: false } ),
				'downgrade-personal'
			)
		);

		expect( page ).toBe( 'https://wordpress.com/setup/plan-upgrade' );
		expect( params ).toEqual( {
			siteSlug: 'example.wordpress.com',
			cancel_to: CANCEL_TO,
			dashboard: 'dotcom',
			redirect_to: `${ REDIRECT_TO }?upgraded=true`,
			ref: 'cancel-flow-downgrade-personal',
		} );
	} );

	test( 'sends a trial to /plans/<site> with the ref', () => {
		expect(
			getCancelFlowPlanChangeUrl(
				makePurchase( { is_trial_plan: true, is_plan_type_downgradable: false } ),
				'switch-to-monthly'
			)
		).toBe( 'https://wordpress.com/plans/example.wordpress.com?ref=cancel-flow-switch-to-monthly' );
	} );

	test.each( [
		[
			'Google Workspace',
			{
				product_slug: 'wp_google_workspace_business_starter_monthly',
				is_plan: false,
				is_google_workspace_product: true,
				bill_period_days: SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD,
			},
		],
		[
			'a plan that can neither upgrade nor downgrade',
			{ is_upgradable: false, is_plan_type_downgradable: false },
		],
	] )( 'falls back to bare /plans/<site> for %s', ( _, overrides ) => {
		expect( getCancelFlowPlanChangeUrl( makePurchase( overrides ), 'change-plan' ) ).toBe(
			'https://wordpress.com/plans/example.wordpress.com'
		);
	} );
} );
