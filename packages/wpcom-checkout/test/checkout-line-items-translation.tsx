import { CheckoutProvider } from '@automattic/composite-checkout';
import { getEmptyResponseCart, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { LineItem } from '../src/checkout-line-items';
import { RemovedFromCartItem } from '../src/removed-from-cart-item';
import { RestorableProductsProvider } from '../src/restorable-products-context';
import type { ResponseCart, ResponseCartProduct } from '@automattic/shopping-cart';

/**
 * Mimics what browser page-translation does: replaces text nodes that React
 * manages with a `<font>` wrapper holding the translated text, leaving React's
 * references to the original text nodes detached.
 */
function simulateTranslation( root: HTMLElement, text: string ) {
	const walker = document.createTreeWalker( root, NodeFilter.SHOW_TEXT );
	const matches: Text[] = [];
	let node = walker.nextNode();
	while ( node ) {
		if ( node.nodeValue?.includes( text ) ) {
			matches.push( node as Text );
		}
		node = walker.nextNode();
	}
	expect( matches.length ).toBeGreaterThan( 0 );
	for ( const textNode of matches ) {
		const font = document.createElement( 'font' );
		font.textContent = textNode.nodeValue;
		textNode.replaceWith( font );
	}
}

/**
 * Renders a line item, applies simulated translation, then moves the cart into
 * the validating state. CheckoutProvider catches render errors in an error
 * boundary and reports them through onPageLoadError, so a failure shows up as a
 * call to it rather than a throw.
 */
function revalidateAfterTranslation(
	product: ResponseCartProduct,
	translatedText: string,
	props: Partial< React.ComponentProps< typeof LineItem > > = {},
	cartOverrides: Partial< ResponseCart > = {}
) {
	const responseCart = { ...getEmptyResponseCart(), products: [ product ], ...cartOverrides };
	const onPageLoadError = jest.fn();
	const ui = ( isValidating: boolean ) => (
		<CheckoutProvider
			paymentMethods={ [] }
			paymentProcessors={ {} }
			isValidating={ isValidating }
			onPageLoadError={ onPageLoadError }
		>
			<LineItem product={ product } responseCart={ responseCart } { ...props } />
		</CheckoutProvider>
	);

	const { container, rerender } = render( ui( false ) );
	simulateTranslation( container, translatedText );
	rerender( ui( true ) );

	return { onPageLoadError };
}

describe( 'LineItem under browser page-translation', () => {
	// React logs caught render errors to console.error; keep the output readable.
	let consoleError: jest.SpyInstance;
	beforeEach( () => {
		consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => undefined );
	} );
	afterEach( () => {
		consoleError.mockRestore();
	} );

	test( 'the monthly comparison price survives a cart revalidation', () => {
		const product: ResponseCartProduct = {
			...getEmptyResponseCartProduct(),
			product_slug: 'personal-bundle-2y',
			product_name: 'WordPress.com Personal',
			currency: 'USD',
			months_per_bill_period: 24,
			item_subtotal_integer: 14400,
			item_original_subtotal_integer: 14400,
			item_original_monthly_cost_integer: 600,
		};

		const { onPageLoadError } = revalidateAfterTranslation( product, '/month', {
			shouldShowComparison: true,
		} );

		expect( onPageLoadError ).not.toHaveBeenCalled();
	} );

	describe( 'sublabel', () => {
		const cases: Array< [ string, Partial< ResponseCartProduct >, string ] > = [
			[
				'yearly plan',
				{
					product_slug: 'value_bundle',
					product_name: 'WordPress.com Premium',
					months_per_bill_period: 12,
					currency: 'USD',
					item_subtotal_integer: 9600,
					item_original_subtotal_integer: 9600,
				},
				'per year',
			],
			[
				'domain registration',
				{
					product_slug: 'domain_reg',
					is_domain_registration: true,
					months_per_bill_period: 12,
					meta: 'example.com',
					product_name: 'example.com',
				},
				'billed annually',
			],
			[
				'domain transfer',
				{
					product_slug: 'domain_transfer',
					volume: 1,
					months_per_bill_period: 12,
					meta: 'example.com',
					product_name: 'example.com',
				},
				'billed annually',
			],
			[
				'storage add-on',
				{
					product_slug: 'wordpress_com_1gb_space_addon_yearly',
					quantity: 2,
					current_quantity: 1,
				},
				'GB extra space',
			],
		];

		test.each( cases )( '%s survives a cart revalidation', ( _name, overrides, translatedText ) => {
			const product: ResponseCartProduct = { ...getEmptyResponseCartProduct(), ...overrides };

			const { onPageLoadError } = revalidateAfterTranslation( product, translatedText );

			expect( onPageLoadError ).not.toHaveBeenCalled();
		} );

		test( 'survives a cart revalidation when the item has a partner coupon', () => {
			const product: ResponseCartProduct = {
				...getEmptyResponseCartProduct(),
				product_slug: 'value_bundle',
				product_name: 'WordPress.com Premium',
				months_per_bill_period: 12,
				currency: 'USD',
				item_subtotal_integer: 9600,
				item_original_subtotal_integer: 9600,
			};

			const { onPageLoadError } = revalidateAfterTranslation(
				product,
				'per year',
				{},
				{
					coupon: 'IONOS_PARTNER',
				}
			);

			expect( onPageLoadError ).not.toHaveBeenCalled();
		} );
	} );
} );

describe( 'RemovedFromCartItem under browser page-translation', () => {
	let consoleError: jest.SpyInstance;
	beforeEach( () => {
		consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => undefined );
	} );
	afterEach( () => {
		consoleError.mockRestore();
	} );

	test( 'survives clicking Restore', async () => {
		const product: ResponseCartProduct = {
			...getEmptyResponseCartProduct(),
			product_name: 'WordPress.com Premium',
		};
		let resolveAdd: () => void = () => undefined;
		const addProductsToCart = jest.fn(
			() =>
				new Promise< void >( ( resolve ) => {
					resolveAdd = resolve;
				} )
		);
		const onPageLoadError = jest.fn();

		const { container } = render(
			<CheckoutProvider
				paymentMethods={ [] }
				paymentProcessors={ {} }
				onPageLoadError={ onPageLoadError }
			>
				<RestorableProductsProvider>
					<RemovedFromCartItem
						product={ product }
						addProductsToCart={ addProductsToCart as never }
					/>
				</RestorableProductsProvider>
			</CheckoutProvider>
		);
		simulateTranslation( container, 'was removed from the shopping cart' );

		await userEvent.click( screen.getByRole( 'button', { name: 'Restore' } ) );
		await act( async () => resolveAdd() );

		expect( addProductsToCart ).toHaveBeenCalled();
		expect( onPageLoadError ).not.toHaveBeenCalled();
	} );
} );

describe( 'LineItem upgrade credit under browser page-translation', () => {
	let consoleError: jest.SpyInstance;
	beforeEach( () => {
		consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => undefined );
	} );
	afterEach( () => {
		consoleError.mockRestore();
	} );

	test( 'survives the credit disappearing when a coupon is applied', () => {
		const planWithCredit: ResponseCartProduct = {
			...getEmptyResponseCartProduct(),
			product_slug: 'value_bundle',
			product_name: 'WordPress.com Premium',
			months_per_bill_period: 12,
			currency: 'USD',
			item_original_subtotal_integer: 9600,
			item_subtotal_integer: 7600,
			cost_overrides: [
				{
					human_readable_reason: 'Upgrade credit',
					override_code: 'recent-plan-proration',
					old_subtotal_integer: 9600,
					new_subtotal_integer: 7600,
					first_unit_only: false,
				},
			],
		};
		const withCoupon: ResponseCartProduct = { ...planWithCredit, coupon_savings_integer: 600 };
		const onPageLoadError = jest.fn();
		const ui = ( product: ResponseCartProduct ) => (
			<CheckoutProvider
				paymentMethods={ [] }
				paymentProcessors={ {} }
				onPageLoadError={ onPageLoadError }
			>
				<LineItem
					product={ product }
					responseCart={ { ...getEmptyResponseCart(), products: [ product ] } }
				/>
			</CheckoutProvider>
		);

		const { container, rerender } = render( ui( planWithCredit ) );
		simulateTranslation( container, 'Upgrade Credit' );
		rerender( ui( withCoupon ) );

		expect( onPageLoadError ).not.toHaveBeenCalled();
	} );
} );
