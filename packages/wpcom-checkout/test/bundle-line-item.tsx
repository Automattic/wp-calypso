import { CheckoutProvider } from '@automattic/composite-checkout';
import { matchers } from '@emotion/jest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BundleLineItem } from '../src/checkout-line-items';
import { buildDomainProduct } from './fixtures/bundle-cart';
import type { CartBundleLineItem } from '../src/group-bundle-line-items';

expect.extend( matchers );

const bundle: CartBundleLineItem = {
	type: 'bundle',
	groupId: 'bundle-abc',
	products: [
		buildDomainProduct(
			{
				uuid: 'primary',
				meta: 'example.com',
				item_subtotal_integer: 2200,
				item_original_subtotal_integer: 2200,
			},
			{ groupId: 'bundle-abc', role: 'primary' }
		),
		buildDomainProduct(
			{
				uuid: 'companion',
				meta: 'example.net',
				item_subtotal_integer: 1800,
				item_original_subtotal_integer: 1800,
			},
			{ groupId: 'bundle-abc', role: 'companion' }
		),
	],
};

// A bundle whose members carry a server-side discount: the discounted price lives
// in item_subtotal_integer while item_original_subtotal_integer keeps the
// pre-discount price.
const discountedBundle: CartBundleLineItem = {
	type: 'bundle',
	groupId: 'bundle-discounted',
	products: [
		buildDomainProduct(
			{
				uuid: 'primary',
				meta: 'example.com',
				item_subtotal_integer: 2200,
				item_original_subtotal_integer: 6500,
			},
			{ groupId: 'bundle-discounted', role: 'primary' }
		),
		buildDomainProduct(
			{
				uuid: 'companion',
				meta: 'example.net',
				item_subtotal_integer: 700,
				item_original_subtotal_integer: 6400,
			},
			{ groupId: 'bundle-discounted', role: 'companion' }
		),
	],
};

function renderBundle( props: Partial< React.ComponentProps< typeof BundleLineItem > > = {} ) {
	return render(
		<CheckoutProvider paymentMethods={ [] } paymentProcessors={ {} }>
			<BundleLineItem bundle={ bundle } { ...props } />
		</CheckoutProvider>
	);
}

describe( 'BundleLineItem', () => {
	test( 'renders the bundle label, billing copy, member domains, and the summed total', () => {
		renderBundle();

		expect( screen.getByText( 'Domain Bundle' ) ).toBeVisible();
		expect( screen.getByText( 'Domain Bundle Registration: billed annually' ) ).toBeVisible();
		expect(
			screen.queryByText( 'First year discounted; domains renew at standard rates.' )
		).not.toBeInTheDocument();
		expect( screen.getByText( 'example.com' ) ).toBeVisible();
		expect( screen.getByText( 'example.net' ) ).toBeVisible();
		// 2200 + 1800 = 4000 smallest-unit => $40.
		expect( screen.getAllByText( /\$40\b/ ) ).toHaveLength( 2 );
	} );

	test( 'uses the checkout product-row layout', () => {
		const { container } = renderBundle();

		const root = container.querySelector( '[data-product-type="domain-bundle"]' );
		expect( root ).toHaveStyleRule( 'display', 'flex' );
		expect( root ).toHaveStyleRule( 'flex-wrap', 'wrap' );
		expect( root ).toHaveStyleRule( 'justify-content', 'space-between' );
	} );

	test( 'does not show individual member prices', () => {
		renderBundle();

		expect( screen.queryByText( /\$22\b/ ) ).not.toBeInTheDocument();
		expect( screen.queryByText( /\$18\b/ ) ).not.toBeInTheDocument();
	} );

	test( 'renders a one-year term row with the bundle total', () => {
		renderBundle();

		expect( screen.getByText( 'One year' ) ).toBeVisible();
		expect( screen.getAllByText( /\$40\b/ ) ).toHaveLength( 2 );
	} );

	test( 'shows no crossed-out price or discount callout when the bundle is not discounted', () => {
		const { container } = renderBundle();

		expect( container.querySelector( 's' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Discount for first year' ) ).not.toBeInTheDocument();
	} );

	test( 'shows the summed original price crossed out when the bundle is discounted', () => {
		renderBundle( { bundle: discountedBundle } );

		// 2200 + 700 = 2900 smallest-unit => $29.
		expect( screen.getAllByText( /\$29\b/ ) ).toHaveLength( 2 );
		// 6500 + 6400 = 12900 smallest-unit => $129, struck through.
		const crossedOut = screen.getByText( /\$129\b/ );
		expect( crossedOut ).toBeVisible();
		expect( crossedOut.tagName ).toBe( 'S' );
		expect( screen.getByText( 'Discount for first year' ) ).toBeVisible();
	} );

	test( 'shows no remove button without hasDeleteButton', () => {
		renderBundle( { removeProductFromCart: jest.fn() } );

		expect( screen.queryByRole( 'button', { name: /Remove/ } ) ).not.toBeInTheDocument();
	} );

	test( 'removes every bundle member when the removal is confirmed', async () => {
		const user = userEvent.setup();
		const removeProductFromCart = jest.fn();

		renderBundle( { hasDeleteButton: true, removeProductFromCart } );

		await user.click( screen.getByRole( 'button', { name: /Remove Domain Bundle from cart/ } ) );
		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );

		expect( removeProductFromCart ).toHaveBeenCalledTimes( 2 );
		expect( removeProductFromCart ).toHaveBeenCalledWith( 'primary' );
		expect( removeProductFromCart ).toHaveBeenCalledWith( 'companion' );
	} );

	test( 'fires onRemoveBundle once with the group id and member count on confirmed removal', async () => {
		const user = userEvent.setup();
		const onRemoveBundle = jest.fn();

		renderBundle( {
			hasDeleteButton: true,
			removeProductFromCart: jest.fn(),
			onRemoveBundle,
		} );

		await user.click( screen.getByRole( 'button', { name: /Remove Domain Bundle from cart/ } ) );
		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );

		expect( onRemoveBundle ).toHaveBeenCalledTimes( 1 );
		expect( onRemoveBundle ).toHaveBeenCalledWith( 'bundle-abc', 2 );
	} );

	test( 'does not fire onRemoveBundle when the removal is cancelled', async () => {
		const user = userEvent.setup();
		const onRemoveBundle = jest.fn();

		renderBundle( {
			hasDeleteButton: true,
			removeProductFromCart: jest.fn(),
			onRemoveBundle,
		} );

		await user.click( screen.getByRole( 'button', { name: /Remove Domain Bundle from cart/ } ) );
		await user.click( screen.getByRole( 'button', { name: 'Cancel' } ) );

		expect( onRemoveBundle ).not.toHaveBeenCalled();
	} );
} );
