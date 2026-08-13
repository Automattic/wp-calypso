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

	test( 'shows the product name when there is no quantity', () => {
		expect(
			getDisplayName(
				makePurchase( {
					product_slug: 'studio-code-ai-credits',
					product_name: 'Studio Code AI Credits',
					renewal_price_tier_usage_quantity: null,
				} )
			)
		).toBe( 'Studio Code AI Credits' );
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
} );
