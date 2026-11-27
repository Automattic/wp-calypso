/**
 * @vitest-environment jsdom
 */
import { checkoutTheme } from '@automattic/composite-checkout';
import { useShoppingCart } from '@automattic/shopping-cart';
import { ThemeProvider } from '@emotion/react';
import { render, screen } from '@testing-library/react';
import { type Mock, vi } from 'vitest';
import { ItemVariantRadioPrice } from '../variant-radio-price';
import type { WPCOMProductVariant } from '../types';

vi.mock( '@automattic/shopping-cart', async () => ( {
	...( await vi.importActual< typeof import( '@automattic/shopping-cart' ) >(
		'@automattic/shopping-cart'
	) ),
	useShoppingCart: vi.fn(),
} ) );
vi.mock( 'calypso/my-sites/checkout/src/hooks/use-checkout-host', () => ( {
	useCheckoutCartKey: () => 'no-site',
	useCheckoutSiteId: () => null,
	useCheckoutUser: () => null,
} ) );

const yearly: WPCOMProductVariant = {
	priceInteger: 12000,
	termIntervalInMonths: 12,
	termIntervalInDays: 365,
	currency: 'USD',
	productId: 1,
	productSlug: 'value_bundle',
	variantLabel: { noun: 'year', adjective: 'yearly' },
	introductoryTerm: '',
	introductoryInterval: 0,
	priceBeforeDiscounts: 12000,
	productBillingTermInMonths: 12,
};

const monthly: WPCOMProductVariant = {
	...yearly,
	priceInteger: 2000,
	termIntervalInMonths: 1,
	termIntervalInDays: 30,
	productId: 2,
	variantLabel: { noun: 'month', adjective: 'monthly' },
	priceBeforeDiscounts: 2000,
	productBillingTermInMonths: 1,
};

function renderPrice() {
	return render(
		<ThemeProvider theme={ checkoutTheme }>
			<ItemVariantRadioPrice variant={ yearly } compareTo={ monthly } />
		</ThemeProvider>
	);
}

describe( 'ItemVariantRadioPrice', () => {
	beforeEach( () => {
		( useShoppingCart as Mock ).mockReturnValue( { couponStatus: 'idle' } );
	} );

	it( 'shows the per-month price with a space before /mo and the discount badge after it', () => {
		renderPrice();

		const price = screen.getByText( '$10 /mo' );
		const badge = screen.getByText( /^Save \d+%$/ );
		expect( price ).toBeVisible();
		expect( badge ).toBeVisible();
		expect(
			price.compareDocumentPosition( badge ) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	} );
} );
