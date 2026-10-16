/**
 * @jest-environment jsdom
 */
import { checkoutTheme } from '@automattic/composite-checkout';
import { getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { ThemeProvider } from '@emotion/react';
import { render, screen } from '@testing-library/react';
import React from 'react';
import {
	A4ATitanInboxMeta,
	getA4ATitanInboxTerms,
	isA4ATitanInboxProduct,
} from '../src/a4a-titan-inbox';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

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

function renderMeta( product: ResponseCartProduct, compact = false ) {
	return render(
		<ThemeProvider theme={ checkoutTheme }>
			<A4ATitanInboxMeta product={ product } compact={ compact } />
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
	test( 'first purchase names the domain and the inbox count only', () => {
		const product: ResponseCartProduct = {
			...titanProduct,
			quantity: 2,
			current_quantity: 0,
			item_subtotal_integer: 0,
			introductory_offer_terms: {
				enabled: true,
				interval_unit: 'day',
				interval_count: 90,
				transition_after_renewal_count: 0,
				should_prorate_when_offer_ends: false,
			},
		};
		renderMeta( product );

		expect( screen.getByText( 'example.com · 2 inboxes' ) ).toBeInTheDocument();
		expect( screen.queryByText( /trial/i ) ).not.toBeInTheDocument();
		expect( screen.queryByText( /due today/i ) ).not.toBeInTheDocument();
	} );

	test( 'increase on an existing subscription shows the added and resulting counts', () => {
		const product: ResponseCartProduct = {
			...titanProduct,
			quantity: 5,
			current_quantity: 2,
			item_subtotal_integer: 390,
		};
		renderMeta( product );

		expect(
			screen.getByText( 'example.com · Adding 3 inboxes · 5 inboxes total' )
		).toBeInTheDocument();
		expect( screen.queryByText( /renews/i ) ).not.toBeInTheDocument();
	} );

	test( 'compact mode renders the same identity and quantity line', () => {
		const product: ResponseCartProduct = {
			...titanProduct,
			quantity: 1,
			current_quantity: 0,
			item_subtotal_integer: 300,
		};
		renderMeta( product, true );

		expect( screen.getByText( 'example.com · 1 inbox' ) ).toBeInTheDocument();
	} );
} );

describe( 'getA4ATitanInboxTerms', () => {
	test( 'never reports a negative added quantity', () => {
		const terms = getA4ATitanInboxTerms( { ...titanProduct, quantity: 1, current_quantity: 3 } );
		expect( terms.additionalQuantity ).toBe( 0 );
		expect( terms.resultingQuantity ).toBe( 1 );
	} );
} );
