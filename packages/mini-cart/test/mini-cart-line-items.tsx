import { CheckoutProvider } from '@automattic/composite-checkout';
import { getEmptyResponseCart, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { RestorableProductsProvider } from '@automattic/wpcom-checkout';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MiniCartLineItems } from '../src/mini-cart-line-items';
import type { ResponseCart, ResponseCartProduct } from '@automattic/shopping-cart';

function domainProduct(
	uuid: string,
	meta: string,
	groupId?: string,
	role?: 'primary' | 'companion',
	prices: { subtotal?: number; original?: number } = {}
): ResponseCartProduct {
	const subtotal = prices.subtotal ?? 2000;
	return {
		...getEmptyResponseCartProduct(),
		uuid,
		meta,
		product_slug: 'domain_reg',
		is_domain_registration: true,
		item_subtotal_integer: subtotal,
		item_original_subtotal_integer: prices.original ?? subtotal,
		extra: groupId
			? { domain_bundle_group_id: groupId, domain_bundle_role: role, expected_bundle_size: '2' }
			: {},
	};
}

function bundleCart(): ResponseCart {
	return {
		...getEmptyResponseCart(),
		products: [
			domainProduct( 'primary', 'example.com', 'bundle-abc', 'primary' ),
			domainProduct( 'companion', 'example.net', 'bundle-abc', 'companion' ),
			domainProduct( 'standalone', 'standalone.com' ),
		],
	};
}

function renderLineItems( showBundleGrouping: boolean, responseCart: ResponseCart = bundleCart() ) {
	return render(
		<CheckoutProvider paymentMethods={ [] } paymentProcessors={ {} }>
			<RestorableProductsProvider>
				<MiniCartLineItems
					responseCart={ responseCart }
					removeProductFromCart={ jest.fn() }
					addProductsToCart={ jest.fn() }
					removeCoupon={ jest.fn() }
					showBundleGrouping={ showBundleGrouping }
				/>
			</RestorableProductsProvider>
		</CheckoutProvider>
	);
}

describe( 'MiniCartLineItems bundle grouping', () => {
	test( 'folds bundle members into one grouped line item when grouping is enabled', () => {
		renderLineItems( true );

		expect( screen.getByText( 'Domain bundle' ) ).toBeVisible();
		// Both members show inside the group; the standalone domain stays on its own line.
		expect( screen.getByText( 'example.com' ) ).toBeVisible();
		expect( screen.getByText( 'example.net' ) ).toBeVisible();
		expect( screen.getByText( 'standalone.com' ) ).toBeVisible();
	} );

	test( 'renders every product on its own line when grouping is disabled', () => {
		renderLineItems( false );

		expect( screen.queryByText( 'Domain bundle' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'example.com' ) ).toBeVisible();
		expect( screen.getByText( 'example.net' ) ).toBeVisible();
		expect( screen.getByText( 'standalone.com' ) ).toBeVisible();
	} );

	test( 'crosses out only the discounted bundle in a multi-bundle cart', () => {
		const cart: ResponseCart = {
			...getEmptyResponseCart(),
			products: [
				// Discounted bundle: original 6500 + 6400 = 12900 ($129), discounted 2200 + 700 = 2900 ($29).
				domainProduct( 'a-primary', 'first.com', 'bundle-a', 'primary', {
					subtotal: 2200,
					original: 6500,
				} ),
				domainProduct( 'a-companion', 'first.net', 'bundle-a', 'companion', {
					subtotal: 700,
					original: 6400,
				} ),
				// Undiscounted bundle: 2000 + 2000 = 4000 ($40), no crossed-out price.
				domainProduct( 'b-primary', 'second.com', 'bundle-b', 'primary' ),
				domainProduct( 'b-companion', 'second.net', 'bundle-b', 'companion' ),
			],
		};

		const { container } = renderLineItems( true, cart );

		const crossedOut = screen.getByText( /\$129\b/ );
		expect( crossedOut ).toBeVisible();
		expect( crossedOut.tagName ).toBe( 'S' );
		expect( screen.getByText( /\$29\b/ ) ).toBeVisible();
		expect( screen.getByText( /\$40\b/ ) ).toBeVisible();

		// Only the discounted bundle shows a strikethrough.
		expect( container.querySelectorAll( 's' ) ).toHaveLength( 1 );
	} );
} );
