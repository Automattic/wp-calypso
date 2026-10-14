/**
 * @jest-environment jsdom
 */
import { checkoutTheme } from '@automattic/composite-checkout';
import { getEmptyResponseCart, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { ThemeProvider } from '@emotion/react';
import { render, screen } from '@testing-library/react';
import React from 'react';
import {
	A4ATitanInboxMeta,
	getA4ATitanInboxTerms,
	isA4ATitanInboxProduct,
} from '../src/a4a-titan-inbox';
import type {
	ResponseCart,
	ResponseCartProduct,
	TermsOfServiceRecord,
} from '@automattic/shopping-cart';

const titanProduct: ResponseCartProduct = {
	...getEmptyResponseCartProduct(),
	product_id: 1234,
	product_slug: 'a4a_pressable_addon_titan_inbox_monthly',
	product_name: 'Pressable Titan Inbox Add-on',
	meta: 'a4a:titan:example.com',
	currency: 'EUR',
	bill_period: '31',
	months_per_bill_period: 1,
	extra: {
		isA4ASitelessCheckout: true,
		agency_id: 7,
		titan_domain: 'example.com',
		titan_plan: 'standard',
	},
};

function termsOfService(
	args: Record< string, unknown >,
	product: ResponseCartProduct = titanProduct
): TermsOfServiceRecord {
	return {
		key: `free_trial_terms,meta:${ product.meta },product_id:${ product.product_id }`,
		code: 'free_trial_terms',
		args: {
			subscription_start_date: '2026-09-14T00:00:00+00:00',
			product_meta: product.meta,
			product_name: product.product_name,
			product_id: product.product_id,
			...args,
		},
	} as unknown as TermsOfServiceRecord;
}

function cart( product: ResponseCartProduct, terms?: TermsOfServiceRecord ): ResponseCart {
	return {
		...getEmptyResponseCart(),
		currency: 'EUR',
		products: [ product ],
		terms_of_service: terms ? [ terms ] : [],
	};
}

function renderMeta( product: ResponseCartProduct, responseCart: ResponseCart, compact = false ) {
	return render(
		<ThemeProvider theme={ checkoutTheme }>
			<A4ATitanInboxMeta product={ product } responseCart={ responseCart } compact={ compact } />
		</ThemeProvider>
	);
}

describe( 'isA4ATitanInboxProduct', () => {
	test( 'is true only for products carrying a Titan domain', () => {
		expect( isA4ATitanInboxProduct( titanProduct ) ).toBe( true );
		expect( isA4ATitanInboxProduct( getEmptyResponseCartProduct() ) ).toBe( false );
		expect(
			isA4ATitanInboxProduct( {
				...titanProduct,
				extra: { isA4ASitelessCheckout: true, a4a_pressable_site_domain: 'example.com' },
			} )
		).toBe( false );
	} );
} );

describe( 'A4ATitanInboxMeta', () => {
	test( 'first trial purchase names the trial, the zero amount and the first charge', () => {
		const product: ResponseCartProduct = {
			...titanProduct,
			quantity: 2,
			current_quantity: 0,
			item_subtotal_integer: 0,
			item_original_subtotal_integer: 600,
			introductory_offer_terms: {
				enabled: true,
				interval_unit: 'day',
				interval_count: 90,
				transition_after_renewal_count: 0,
				should_prorate_when_offer_ends: false,
			},
		};
		const terms = termsOfService( {
			subscription_auto_renew_date: '2026-12-13T00:00:00+00:00',
			subscription_end_of_promotion_date: '2026-12-13T00:00:00+00:00',
			regular_renewal_price_integer: 600,
		} );
		renderMeta( product, cart( product, terms ) );

		expect( screen.getByText( 'example.com · 2 inboxes' ) ).toBeInTheDocument();
		expect( screen.getByText( '90-day free trial: €0 due today.' ) ).toBeInTheDocument();
		expect(
			screen.getByText( 'Then €6/month for all 2 inboxes starting December 13, 2026.' )
		).toBeInTheDocument();
		expect( screen.queryByText( /unchanged/ ) ).not.toBeInTheDocument();
	} );

	test( 'increase during a trial keeps the original trial end and never names a new trial', () => {
		const product: ResponseCartProduct = {
			...titanProduct,
			quantity: 5,
			current_quantity: 2,
			item_subtotal_integer: 0,
			item_original_subtotal_integer: 1500,
			introductory_offer_terms: {
				enabled: true,
				interval_unit: 'day',
				interval_count: 90,
				transition_after_renewal_count: 0,
				should_prorate_when_offer_ends: false,
			},
		};
		const terms = termsOfService( {
			subscription_auto_renew_date: '2026-12-13T00:00:00+00:00',
			subscription_end_of_promotion_date: '2026-12-13T00:00:00+00:00',
			regular_renewal_price_integer: 1500,
		} );
		renderMeta( product, cart( product, terms ) );

		expect(
			screen.getByText( 'example.com · Adding 3 inboxes · 5 inboxes total' )
		).toBeInTheDocument();
		expect(
			screen.getByText( '€0 due today, covered by your existing free trial.' )
		).toBeInTheDocument();
		expect( screen.getByText( 'Trial ends December 13, 2026 (unchanged).' ) ).toBeInTheDocument();
		expect(
			screen.getByText( 'Then €15/month for all 5 inboxes starting December 13, 2026.' )
		).toBeInTheDocument();
		expect( screen.queryByText( /free trial:/ ) ).not.toBeInTheDocument();
	} );

	test( 'paid increase shows the prorated amount due today and the full renewal', () => {
		const product: ResponseCartProduct = {
			...titanProduct,
			quantity: 5,
			current_quantity: 2,
			item_subtotal_integer: 390,
			item_original_subtotal_integer: 900,
		};
		const terms = termsOfService( {
			subscription_auto_renew_date: '2026-10-02T00:00:00+00:00',
			subscription_end_of_promotion_date: '2026-10-02T00:00:00+00:00',
			regular_renewal_price_integer: 1500,
		} );
		renderMeta( product, cart( product, terms ) );

		expect(
			screen.getByText( 'example.com · Adding 3 inboxes · 5 inboxes total' )
		).toBeInTheDocument();
		expect( screen.getByText( 'Due today: €3.90.' ) ).toBeInTheDocument();
		expect(
			screen.getByText( 'Renews October 2, 2026 at €15/month for all 5 inboxes.' )
		).toBeInTheDocument();
		expect( screen.queryByText( /trial/ ) ).not.toBeInTheDocument();
	} );

	test( 'paid increase without a terms record falls back to the post-purchase expiry date', () => {
		const product: ResponseCartProduct = {
			...titanProduct,
			quantity: 5,
			current_quantity: 2,
			item_subtotal_integer: 390,
			subscription_post_purchase_expiry_date: '2026-10-02T00:00:00+00:00',
		};
		renderMeta( product, cart( product ) );

		expect( screen.getByText( 'Due today: €3.90.' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Renews October 2, 2026 for all 5 inboxes.' ) ).toBeInTheDocument();
	} );

	test( 'compact mode shows only the identity and quantity lines', () => {
		const product: ResponseCartProduct = {
			...titanProduct,
			quantity: 1,
			current_quantity: 0,
			item_subtotal_integer: 300,
		};
		renderMeta( product, cart( product ), true );

		expect( screen.getByText( 'example.com · 1 inbox' ) ).toBeInTheDocument();
		expect( screen.queryByText( /Due today/ ) ).not.toBeInTheDocument();
	} );
} );

describe( 'getA4ATitanInboxTerms', () => {
	test( 'ignores a terms record that belongs to another product', () => {
		const product: ResponseCartProduct = {
			...titanProduct,
			quantity: 2,
			current_quantity: 0,
			item_subtotal_integer: 0,
		};
		const other = termsOfService(
			{
				subscription_auto_renew_date: '2026-12-13T00:00:00+00:00',
				regular_renewal_price_integer: 999,
			},
			{ ...titanProduct, product_id: 999, meta: 'a4a:titan:other.com' }
		);
		const terms = getA4ATitanInboxTerms( product, cart( product, other ) );
		expect( terms.nextBillingDate ).toBeNull();
		expect( terms.renewalPriceInteger ).toBeNull();
	} );
} );
