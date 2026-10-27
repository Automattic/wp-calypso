import { CheckoutProvider } from '@automattic/composite-checkout';
import {
	createShoppingCartManagerClient,
	getEmptyResponseCart,
	getEmptyResponseCartProduct,
	ShoppingCartProvider,
} from '@automattic/shopping-cart';
import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PropsWithChildren } from 'react';
import { ApplePaySubmitButton } from '../src/payment-methods/apple-pay';
import { GooglePaySubmitButton } from '../src/payment-methods/google-pay';
import { usePaymentRequestOptions } from '../src/payment-methods/web-pay-utils';
import type { StripeConfiguration } from '@automattic/calypso-stripe';
import type { ResponseCart } from '@automattic/shopping-cart';
import type { Stripe } from '@stripe/stripe-js';

const stripeConfiguration: StripeConfiguration = {
	processor_id: 'stripe_ie',
	public_key: 'pk_test_wallet',
	js_url: 'https://js.stripe.com/v3/',
};

function createCart( overrides: Partial< ResponseCart > = {} ): ResponseCart {
	return {
		...getEmptyResponseCart(),
		currency: 'USD',
		products: [
			{
				...getEmptyResponseCartProduct(),
				product_name: 'Test Plan',
				item_subtotal_integer: 10000,
			},
		],
		sub_total_integer: 10000,
		sub_total_with_taxes_integer: 11000,
		total_tax_integer: 1000,
		total_cost_integer: 11000,
		tax: { location: {}, display_taxes: true },
		...overrides,
	};
}

async function createCartWrapper( cart: ResponseCart ) {
	const getCart = jest.fn().mockResolvedValue( cart );
	const managerClient = createShoppingCartManagerClient( {
		getCart,
		setCart: async () => cart,
	} );
	const manager = managerClient.forCartKey( 'no-site' );
	await manager.fetchInitialCart();

	function wrapper( { children }: PropsWithChildren ) {
		return (
			<ShoppingCartProvider managerClient={ managerClient }>{ children }</ShoppingCartProvider>
		);
	}

	return {
		wrapper,
		async updateCart( nextCart: ResponseCart ) {
			getCart.mockResolvedValue( nextCart );
			await act( () => manager.actions.reloadFromServer() );
		},
	};
}

async function renderOptions( cart: ResponseCart ) {
	const { wrapper, updateCart } = await createCartWrapper( cart );
	return {
		...renderHook( () => usePaymentRequestOptions( stripeConfiguration, 'no-site' ), { wrapper } ),
		updateCart,
	};
}

describe( 'usePaymentRequestOptions', () => {
	test( 'includes tax without changing the total or payer options', async () => {
		const { result } = await renderOptions( createCart() );

		expect( result.current ).toEqual( {
			country: 'IE',
			currency: 'usd',
			total: { label: 'Total', amount: 11000 },
			displayItems: [
				{ label: 'Test Plan', amount: 10000 },
				{ label: 'Tax', amount: 1000 },
			],
			requestPayerName: true,
			requestPayerPhone: false,
			requestPayerEmail: false,
			requestShipping: false,
		} );
	} );

	test( 'omits hidden taxes and unused credits', async () => {
		const { result } = await renderOptions(
			createCart( { tax: { location: {}, display_taxes: false } } )
		);

		expect( result.current?.displayItems ).toEqual( [ { label: 'Test Plan', amount: 10000 } ] );
		expect( result.current?.total.amount ).toBe( 11000 );
	} );

	test( 'retains a displayed zero-tax row', async () => {
		const { result } = await renderOptions(
			createCart( {
				total_tax_integer: 0,
				sub_total_with_taxes_integer: 10000,
				total_cost_integer: 10000,
			} )
		);

		expect( result.current?.displayItems ).toContainEqual( { label: 'Tax', amount: 0 } );
	} );

	test( 'uses the existing business-use tax label and visibility', async () => {
		const { result } = await renderOptions(
			createCart( {
				tax: {
					display_taxes: false,
					location: { is_for_business: true, country_code: 'US', subdivision_code: 'CT' },
				},
			} )
		);

		expect( result.current?.displayItems ).toContainEqual( {
			label: 'Tax (CT business use)',
			amount: 1000,
		} );
	} );

	test( 'shows partial credits as a deduction after tax', async () => {
		const { result } = await renderOptions(
			createCart( { credits_integer: 2500, total_cost_integer: 8500 } )
		);

		expect( result.current?.displayItems ).toEqual( [
			{ label: 'Test Plan', amount: 10000 },
			{ label: 'Tax', amount: 1000 },
			{ label: 'Credits', amount: -2500 },
		] );
		expect( result.current?.total.amount ).toBe( 8500 );
	} );

	test( 'caps excess credits at the amount used by the cart', async () => {
		const { result } = await renderOptions(
			createCart( { credits_integer: 20000, total_cost_integer: 0 } )
		);

		expect( result.current?.displayItems ).toContainEqual( { label: 'Credits', amount: -11000 } );
		expect( result.current?.total.amount ).toBe( 0 );
	} );

	test( 'keeps discounted product amounts and does not subtract coupons twice', async () => {
		const product = getEmptyResponseCartProduct();
		const { result } = await renderOptions(
			createCart( {
				products: [
					{ ...product, product_name: 'Plan', item_subtotal_integer: 8000 },
					{ ...product, uuid: 'domain', product_name: 'Domain', item_subtotal_integer: 2000 },
				],
				coupon: 'SAVE',
				coupon_savings_total_integer: 2000,
				credits_integer: 2500,
				total_cost_integer: 8500,
			} )
		);

		expect( result.current?.displayItems ).toEqual( [
			{ label: 'Plan', amount: 8000 },
			{ label: 'Domain', amount: 2000 },
			{ label: 'Tax', amount: 1000 },
			{ label: 'Credits', amount: -2500 },
		] );
	} );

	test( 'keeps amounts in the smallest currency unit for JPY', async () => {
		const { result } = await renderOptions(
			createCart( { currency: 'JPY', credits_integer: 2500, total_cost_integer: 8500 } )
		);

		expect( result.current?.currency ).toBe( 'jpy' );
		expect( result.current?.displayItems ).toContainEqual( { label: 'Tax', amount: 1000 } );
		expect( result.current?.displayItems ).toContainEqual( { label: 'Credits', amount: -2500 } );
		expect( result.current?.total.amount ).toBe( 8500 );
	} );

	test( 'refreshes tax visibility when products and the total stay the same', async () => {
		const cart = createCart( { tax: { location: {}, display_taxes: false } } );
		const { result, updateCart } = await renderOptions( cart );
		await updateCart( { ...cart, tax: { ...cart.tax, display_taxes: true } } );

		expect( result.current?.displayItems ).toContainEqual( { label: 'Tax', amount: 1000 } );
	} );

	test( 'refreshes tax and credit amounts when products and the total stay the same', async () => {
		const cart = createCart( { credits_integer: 2500, total_cost_integer: 8500 } );
		const { result, updateCart } = await renderOptions( cart );
		await updateCart( {
			...cart,
			total_tax_integer: 2000,
			sub_total_with_taxes_integer: 12000,
			credits_integer: 3500,
		} );

		expect( result.current?.displayItems ).toEqual( [
			{ label: 'Test Plan', amount: 10000 },
			{ label: 'Tax', amount: 2000 },
			{ label: 'Credits', amount: -3500 },
		] );
		expect( result.current?.total.amount ).toBe( 8500 );
	} );
} );

describe.each( [
	[ 'Apple Pay', ApplePaySubmitButton ],
	[ 'Google Pay', GooglePaySubmitButton ],
] as const )( '%s payment request', ( _, SubmitButton ) => {
	test( 'passes tax and credit rows to Stripe when opening the payment sheet', async () => {
		const user = userEvent.setup();
		const { wrapper: CartWrapper } = await createCartWrapper(
			createCart( { credits_integer: 2500, total_cost_integer: 8500 } )
		);
		const request = {
			canMakePayment: jest.fn().mockResolvedValue( { applePay: true, googlePay: true } ),
			on: jest.fn(),
			show: jest.fn(),
		};
		const paymentRequest = jest.fn().mockReturnValue( request );
		const stripe = { paymentRequest } as unknown as Stripe;

		render(
			<CartWrapper>
				<CheckoutProvider paymentMethods={ [] } paymentProcessors={ {} }>
					<SubmitButton
						stripe={ stripe }
						stripeConfiguration={ stripeConfiguration }
						cartKey="no-site"
					/>
				</CheckoutProvider>
			</CartWrapper>
		);

		await waitFor( () => expect( screen.getByRole( 'button' ) ).toBeEnabled() );
		await user.click( screen.getByRole( 'button' ) );

		expect( paymentRequest ).toHaveBeenLastCalledWith(
			expect.objectContaining( {
				total: { label: 'Total', amount: 8500 },
				displayItems: [
					{ label: 'Test Plan', amount: 10000 },
					{ label: 'Tax', amount: 1000 },
					{ label: 'Credits', amount: -2500 },
				],
			} )
		);
		expect( request.show ).toHaveBeenCalledTimes( 1 );
	} );
} );
