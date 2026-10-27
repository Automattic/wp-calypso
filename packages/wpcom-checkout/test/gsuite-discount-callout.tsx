import { CheckoutProvider } from '@automattic/composite-checkout';
import { getEmptyResponseCart, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { LineItem } from '../src/checkout-line-items';

const googleWorkspaceProduct = {
	...getEmptyResponseCartProduct(),
	product_slug: 'wp_google_workspace_business_starter_yearly',
	product_name: 'Google Workspace',
	meta: 'example.com',
	is_sale_coupon_applied: true,
	extra: { google_apps_users: [ { email: 'me@example.com' } ] },
};

function renderLineItem( product: typeof googleWorkspaceProduct ) {
	return render(
		<CheckoutProvider paymentMethods={ [] } paymentProcessors={ {} }>
			<LineItem
				product={ product }
				responseCart={ { ...getEmptyResponseCart(), products: [ product ] } }
			/>
		</CheckoutProvider>
	);
}

describe( 'Google Workspace discount callout', () => {
	test( 'shows the first-year discount when a sale coupon lowers the price', () => {
		renderLineItem( {
			...googleWorkspaceProduct,
			item_subtotal_integer: 3000,
			item_original_subtotal_integer: 6000,
		} );
		expect( screen.getByText( 'me@example.com' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Discount for first year' ) ).toBeInTheDocument();
	} );

	test( 'does not show the discount when the price is not lowered', () => {
		renderLineItem( {
			...googleWorkspaceProduct,
			item_subtotal_integer: 6000,
			item_original_subtotal_integer: 6000,
		} );
		expect( screen.getByText( 'me@example.com' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Discount for first year' ) ).not.toBeInTheDocument();
	} );
} );
