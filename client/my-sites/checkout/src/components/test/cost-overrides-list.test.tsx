/**
 * @jest-environment jsdom
 */

import { checkoutTheme } from '@automattic/composite-checkout';
import { getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { ThemeProvider } from '@emotion/react';
import { render, screen } from '@testing-library/react';
import { BundleProductAndCostOverridesList } from '../cost-overrides-list';
import type { CartBundleLineItem } from '@automattic/wpcom-checkout';

function buildDomainProduct( overrides: { uuid: string; meta: string; subtotal: number } ) {
	return {
		...getEmptyResponseCartProduct(),
		product_slug: 'domain_reg',
		is_domain_registration: true,
		uuid: overrides.uuid,
		meta: overrides.meta,
		item_subtotal_integer: overrides.subtotal,
	};
}

const bundle: CartBundleLineItem = {
	type: 'bundle',
	groupId: 'bundle-abc',
	products: [
		buildDomainProduct( { uuid: 'primary', meta: 'example.com', subtotal: 2200 } ),
		buildDomainProduct( { uuid: 'companion', meta: 'example.net', subtotal: 1800 } ),
	],
};

function renderBundleRow() {
	return render(
		<ThemeProvider theme={ checkoutTheme }>
			<BundleProductAndCostOverridesList bundle={ bundle } />
		</ThemeProvider>
	);
}

describe( 'BundleProductAndCostOverridesList', () => {
	it( 'renders the bundle label, each member domain, and the summed total', () => {
		renderBundleRow();

		expect( screen.getByText( 'Domain bundle' ) ).toBeVisible();
		expect( screen.getByText( 'example.com' ) ).toBeVisible();
		expect( screen.getByText( 'example.net' ) ).toBeVisible();
		// 2200 + 1800 = 4000 smallest-unit => $40.
		expect( screen.getByText( /\$40\b/ ) ).toBeVisible();
	} );
} );
