/**
 * @jest-environment jsdom
 */
import { useShoppingCart } from '@automattic/shopping-cart';
import { act, render, screen } from '@testing-library/react';
import CheckoutMain from 'calypso/my-sites/checkout/src/components/checkout-main';
import BillingDragonCheckout from '..';
import type { ReactNode } from 'react';

let mockAgencyId: number | undefined = 42;

jest.mock( '@automattic/shopping-cart', () => ( {
	...jest.requireActual( '@automattic/shopping-cart' ),
	useShoppingCart: jest.fn(),
} ) );

jest.mock( 'i18n-calypso', () => ( {
	...jest.requireActual( 'i18n-calypso' ),
	useTranslate: () => ( text: string ) => text,
} ) );

jest.mock( 'calypso/state', () => ( {
	useDispatch: () => jest.fn(),
	useSelector: ( selector: ( state: unknown ) => unknown ) => selector( {} ),
} ) );
jest.mock( 'calypso/state/analytics/actions', () => ( { recordTracksEvent: jest.fn() } ) );

jest.mock( 'calypso/state/a8c-for-agencies/agency/selectors', () => ( {
	getActiveAgency: () => ( mockAgencyId ? { id: mockAgencyId } : undefined ),
} ) );
jest.mock( 'calypso/state/current-user/selectors', () => ( {
	getCurrentUserLocale: () => 'en',
} ) );
jest.mock( 'calypso/state/selectors/has-loaded-sites', () => () => true );
jest.mock( 'calypso/state/sites/selectors/get-site', () => () => undefined );

jest.mock( 'calypso/my-sites/checkout/src/hooks/use-prepare-products-for-cart', () => () => ( {
	productsForCart: [],
	isLoading: false,
	error: null,
} ) );

const passthrough = ( { children }: { children?: ReactNode } ) => <>{ children }</>;
jest.mock( '@automattic/calypso-stripe', () => ( { StripeHookProvider: passthrough } ) );
jest.mock( '@automattic/composite-checkout', () => ( { CheckoutErrorBoundary: passthrough } ) );
jest.mock( 'calypso/my-sites/checkout/calypso-shopping-cart-provider', () => passthrough );
jest.mock( 'calypso/my-sites/checkout/checkout-query-client-provider', () => passthrough );
jest.mock( 'calypso/my-sites/checkout/src/components/cart-message-cleanup', () => () => null );
jest.mock( 'calypso/my-sites/checkout/src/components/checkout-main', () =>
	jest.fn( () => <div data-testid="checkout-main" /> )
);

const replaceProductsInCart = jest.fn();
const successUrl =
	'https://my.pressable.com/titan_email/checkout_return?agency_id=42&checkout_status=SUCCESS&signature=a%2Bb%2fc%3D';
const cancelUrl =
	'https://my.pressable.com/titan_email/checkout_return?agency_id=42&checkout_status=CANCELED&signature=d%2Be%2ff%3D';
const pressableProduct = {
	extra: {
		isA4ASitelessCheckout: true,
		agency_id: 42,
		titan_domain: 'example.com',
		titan_plan: 'standard',
		afterPurchaseUrl: successUrl,
		pressableCancelUrl: cancelUrl,
	},
};

function setFormSubmitting( isFormSubmitting: boolean ) {
	act( () => {
		jest
			.mocked( CheckoutMain )
			.mock.calls.at( -1 )?.[ 0 ]
			.onFormSubmittingChange?.( isFormSubmitting );
	} );
}

function mockCart( {
	isLoading = false,
	loadingError = null,
	products = [],
}: {
	isLoading?: boolean;
	loadingError?: string | null;
	products?: { extra?: Record< string, unknown > }[];
} ) {
	( useShoppingCart as jest.Mock ).mockReturnValue( {
		isLoading,
		loadingError,
		responseCart: { products },
		replaceProductsInCart,
	} );
}

function renderPrepared() {
	return render( <BillingDragonCheckout cartItems={ [] } skipActiveCart withA8cLogo={ false } /> );
}

describe( 'BillingDragonCheckout in prepared cart mode', () => {
	beforeEach( () => {
		replaceProductsInCart.mockReset();
		jest.mocked( CheckoutMain ).mockClear();
		mockAgencyId = 42;
	} );

	it( 'shows the placeholder while the prepared cart loads', () => {
		mockCart( { isLoading: true } );
		const { container } = renderPrepared();

		expect( container.querySelector( '.client-checkout-placeholder' ) ).toBeInTheDocument();
		expect( screen.queryByTestId( 'checkout-main' ) ).not.toBeInTheDocument();
	} );

	it( 'shows the checkout once the prepared cart has loaded, without replacing it', () => {
		mockCart( { products: [ { extra: { isA4ASitelessCheckout: true, agency_id: 42 } } ] } );
		renderPrepared();

		expect( screen.getByTestId( 'checkout-main' ) ).toBeInTheDocument();
		expect( replaceProductsInCart ).not.toHaveBeenCalled();
	} );

	it( 'shows the error card when there is no prepared cart', () => {
		mockCart( { products: [] } );
		const { container } = renderPrepared();

		expect( screen.getByText( 'We could not find your prepared order.' ) ).toBeInTheDocument();
		expect( container.querySelector( '.client-checkout-placeholder' ) ).not.toBeInTheDocument();
	} );

	it( 'shows the error card when the prepared cart fails to load', () => {
		mockCart( { loadingError: 'boom' } );
		const { container } = renderPrepared();

		expect( screen.getByText( 'Unable to load your prepared order.' ) ).toBeInTheDocument();
		expect( container.querySelector( '.client-checkout-placeholder' ) ).not.toBeInTheDocument();
	} );

	it( 'uses the signed success destination and renders cancellation as an unchanged link', () => {
		mockCart( { products: [ pressableProduct ] } );
		renderPrepared();

		expect( jest.mocked( CheckoutMain ).mock.calls.at( -1 )?.[ 0 ].redirectTo ).toBe( successUrl );
		expect( screen.getByRole( 'link', { name: 'Back to Pressable' } ) ).toHaveAttribute(
			'href',
			cancelUrl
		);
	} );

	it( 'disables Back during form submission and re-enables it after payment failure', () => {
		mockCart( { products: [ pressableProduct ] } );
		renderPrepared();

		setFormSubmitting( true );
		const back = screen.getByRole( 'button', { name: 'Back to Pressable' } );
		expect( back ).toBeDisabled();
		expect( back ).not.toHaveAttribute( 'href' );

		setFormSubmitting( false );
		expect( screen.getByRole( 'link', { name: 'Back to Pressable' } ) ).toHaveAttribute(
			'href',
			cancelUrl
		);
	} );

	it( 'retains disabled Back when form submission clears the cart and unmounts checkout', () => {
		mockCart( { products: [ pressableProduct ] } );
		const { rerender } = renderPrepared();
		setFormSubmitting( true );

		mockCart( {} );
		rerender( <BillingDragonCheckout cartItems={ [] } skipActiveCart withA8cLogo={ false } /> );

		expect( screen.queryByTestId( 'checkout-main' ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Back to Pressable' } ) ).toBeDisabled();
	} );

	it( 'keeps Back usable after a cart load error and discards it when the agency changes', () => {
		mockCart( { products: [ pressableProduct ] } );
		const { rerender } = renderPrepared();
		mockCart( { loadingError: 'boom' } );
		rerender( <BillingDragonCheckout cartItems={ [] } skipActiveCart withA8cLogo={ false } /> );
		expect( screen.getByRole( 'link', { name: 'Back to Pressable' } ) ).toHaveAttribute(
			'href',
			cancelUrl
		);

		mockAgencyId = undefined;
		rerender( <BillingDragonCheckout cartItems={ [] } skipActiveCart withA8cLogo={ false } /> );
		mockAgencyId = 42;
		rerender( <BillingDragonCheckout cartItems={ [] } skipActiveCart withA8cLogo={ false } /> );
		expect( screen.queryByRole( 'link', { name: 'Back to Pressable' } ) ).not.toBeInTheDocument();
	} );

	it( 'does not use Pressable navigation for ordinary prepared carts', () => {
		mockCart( { products: [ { extra: { isA4ASitelessCheckout: true, agency_id: 42 } } ] } );
		renderPrepared();

		expect( jest.mocked( CheckoutMain ).mock.calls.at( -1 )?.[ 0 ].redirectTo ).toBe(
			`${ window.location.origin }/purchases/licenses`
		);
		expect( screen.queryByText( 'Back to Pressable' ) ).not.toBeInTheDocument();
	} );

	it( 'does not let an invalid Pressable SUCCESS URL reach the cart redirect fallback', () => {
		mockCart( {
			products: [ { extra: { ...pressableProduct.extra, afterPurchaseUrl: cancelUrl } } ],
		} );
		renderPrepared();

		expect( screen.getByText( 'We could not find your prepared order.' ) ).toBeVisible();
		expect( screen.queryByTestId( 'checkout-main' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Back to Pressable' ) ).not.toBeInTheDocument();
	} );
} );
