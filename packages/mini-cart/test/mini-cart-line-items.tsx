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
	role?: 'primary' | 'companion'
): ResponseCartProduct {
	return {
		...getEmptyResponseCartProduct(),
		uuid,
		meta,
		product_slug: 'domain_reg',
		is_domain_registration: true,
		item_subtotal_integer: 2000,
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

function renderLineItems( showBundleGrouping: boolean ) {
	return render(
		<CheckoutProvider paymentMethods={ [] } paymentProcessors={ {} }>
			<RestorableProductsProvider>
				<MiniCartLineItems
					responseCart={ bundleCart() }
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
} );
