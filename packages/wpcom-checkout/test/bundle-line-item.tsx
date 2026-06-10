import { CheckoutProvider } from '@automattic/composite-checkout';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BundleLineItem } from '../src/checkout-line-items';
import { buildDomainProduct } from './fixtures/bundle-cart';
import type { CartBundleLineItem } from '../src/group-bundle-line-items';

const bundle: CartBundleLineItem = {
	type: 'bundle',
	groupId: 'bundle-abc',
	products: [
		buildDomainProduct(
			{ uuid: 'primary', meta: 'example.com', item_subtotal_integer: 2200 },
			{ groupId: 'bundle-abc', role: 'primary' }
		),
		buildDomainProduct(
			{ uuid: 'companion', meta: 'example.net', item_subtotal_integer: 1800 },
			{ groupId: 'bundle-abc', role: 'companion' }
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
	test( 'renders the bundle label, member domains, and the summed total', () => {
		renderBundle();

		expect( screen.getByText( 'Domain bundle' ) ).toBeVisible();
		expect( screen.getByText( 'example.com' ) ).toBeVisible();
		expect( screen.getByText( 'example.net' ) ).toBeVisible();
		// 2200 + 1800 = 4000 smallest-unit => $40.
		expect( screen.getByText( /\$40\b/ ) ).toBeVisible();
	} );

	test( 'shows no remove button without hasDeleteButton', () => {
		renderBundle( { removeProductFromCart: jest.fn() } );

		expect( screen.queryByRole( 'button', { name: /Remove/ } ) ).not.toBeInTheDocument();
	} );

	test( 'removes every bundle member when the removal is confirmed', async () => {
		const user = userEvent.setup();
		const removeProductFromCart = jest.fn();

		renderBundle( { hasDeleteButton: true, removeProductFromCart } );

		await user.click( screen.getByRole( 'button', { name: /Remove Domain bundle from cart/ } ) );
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

		await user.click( screen.getByRole( 'button', { name: /Remove Domain bundle from cart/ } ) );
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

		await user.click( screen.getByRole( 'button', { name: /Remove Domain bundle from cart/ } ) );
		await user.click( screen.getByRole( 'button', { name: 'Cancel' } ) );

		expect( onRemoveBundle ).not.toHaveBeenCalled();
	} );
} );
