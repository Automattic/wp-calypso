/**
 * @jest-environment jsdom
 */

import { getDisplayName } from '../raw-purchase-helpers';
import type { Purchase } from '@automattic/api-core';

function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		product_name: '',
		product_slug: '',
		...overrides,
	} as Purchase;
}

describe( 'getDisplayName', () => {
	const priceTier = {
		minimum_units: 1,
		minimum_price: 0,
		minimum_price_display: '$0',
		maximum_price: 0,
	};

	test( 'shows the credit count for a Studio Code AI Credits purchase', () => {
		expect(
			getDisplayName(
				makePurchase( {
					product_slug: 'studio-code-ai-credits',
					product_name: 'Studio Code AI Credits',
					renewal_price_tier_usage_quantity: 500,
				} )
			)
		).toBe( 'Studio Code AI Credits (500 credits)' );
	} );

	test.each( [ null, undefined, 0 ] )(
		'shows the product name for a quantity of %p',
		( quantity ) => {
			expect(
				getDisplayName(
					makePurchase( {
						product_slug: 'studio-code-ai-credits',
						product_name: 'Studio Code AI Credits',
						renewal_price_tier_usage_quantity: quantity,
					} )
				)
			).toBe( 'Studio Code AI Credits' );
		}
	);

	test( 'shows the credit count ahead of the plan title', () => {
		expect(
			getDisplayName(
				makePurchase( {
					product_slug: 'studio-code-ai-credits',
					product_name: 'Studio Code AI Credits',
					renewal_price_tier_usage_quantity: 500,
					is_plan: true,
				} )
			)
		).toBe( 'Studio Code AI Credits (500 credits)' );
	} );

	test( 'leaves Akismet Pro titles alone', () => {
		expect(
			getDisplayName(
				makePurchase( {
					product_slug: 'ak_pro5h_yearly',
					product_name: 'Akismet Pro (500 requests/month)',
					renewal_price_tier_usage_quantity: 2,
				} )
			)
		).toBe( 'Akismet Pro (1000 requests/month)' );
	} );

	test( 'leaves Jetpack AI titles alone', () => {
		expect(
			getDisplayName(
				makePurchase( {
					product_slug: 'jetpack_ai_monthly',
					product_name: 'Jetpack AI',
					renewal_price_tier_usage_quantity: 1000,
					price_tier_list: [ priceTier ],
				} )
			)
		).toBe( 'Jetpack AI (1,000 requests per month)' );
	} );

	test( 'leaves Jetpack Stats titles alone', () => {
		expect(
			getDisplayName(
				makePurchase( {
					product_slug: 'jetpack_stats_monthly',
					product_name: 'Jetpack Stats',
					renewal_price_tier_usage_quantity: 10000,
					price_tier_list: [ priceTier ],
				} )
			)
		).toBe( 'Jetpack Stats (Paid) (10,000 views per month)' );
	} );

	test( 'leaves storage add-on titles alone', () => {
		expect(
			getDisplayName(
				makePurchase( {
					product_slug: 'wordpress_com_1gb_space_addon_yearly',
					product_name: 'Extra Storage',
					renewal_price_tier_usage_quantity: 50,
				} )
			)
		).toBe( 'Extra Storage 50 GB' );
	} );
} );
