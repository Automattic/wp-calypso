/**
 * @vitest-environment jsdom
 */
import { useShoppingCart } from '@automattic/shopping-cart';
import { act, render, screen } from '@testing-library/react';
import { type Mock, vi } from 'vitest';
import CheckoutMain from 'calypso/my-sites/checkout/src/components/checkout-main';
import BillingDragonCheckout from '..';
import type { ReactNode } from 'react';

vi.mock( '@automattic/shopping-cart', async () => ( {
	...( await vi.importActual< typeof import( '@automattic/shopping-cart' ) >(
		'@automattic/shopping-cart'
	) ),
	useShoppingCart: vi.fn(),
} ) );

vi.mock( 'i18n-calypso', async () => ( {
	...( await vi.importActual< typeof import( 'i18n-calypso' ) >( 'i18n-calypso' ) ),
	useTranslate: () => ( text: string ) => text,
} ) );

vi.mock( 'calypso/state', () => ( {
	useDispatch: () => vi.fn(),
	useSelector: ( selector: ( state: unknown ) => unknown ) => selector( {} ),
} ) );
vi.mock( 'calypso/state/analytics/actions', () => ( { recordTracksEvent: vi.fn() } ) );

vi.mock( 'calypso/state/a8c-for-agencies/agency/selectors', () => ( {
	getActiveAgency: () => ( { id: 42 } ),
} ) );
vi.mock( 'calypso/state/current-user/selectors', () => ( {
	getCurrentUserLocale: () => 'en',
} ) );
vi.mock( 'calypso/state/selectors/has-loaded-sites', () => ( { default: () => true } ) );
vi.mock( 'calypso/state/sites/selectors/get-site', () => ( { default: () => undefined } ) );

vi.mock( 'calypso/my-sites/checkout/src/hooks/use-prepare-products-for-cart', () => ( {
	default: () => ( {
		productsForCart: [],
		isLoading: false,
		error: null,
	} ),
} ) );

const { passthrough } = vi.hoisted( () => ( {
	passthrough: ( { children }: { children?: ReactNode } ) => <>{ children }</>,
} ) );
vi.mock( '@automattic/calypso-stripe', () => ( { StripeHookProvider: passthrough } ) );
vi.mock( '@automattic/composite-checkout', () => ( { CheckoutErrorBoundary: passthrough } ) );
vi.mock( 'calypso/my-sites/checkout/calypso-shopping-cart-provider', () => ( {
	default: passthrough,
} ) );
vi.mock( 'calypso/my-sites/checkout/checkout-query-client-provider', () => ( {
	default: passthrough,
} ) );
vi.mock( 'calypso/my-sites/checkout/src/components/cart-message-cleanup', () => ( {
	default: () => null,
} ) );
vi.mock( 'calypso/my-sites/checkout/src/components/checkout-main', () => ( {
	default: vi.fn( () => <div data-testid="checkout-main" /> ),
} ) );

const replaceProductsInCart = vi.fn();
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
		vi.mocked( CheckoutMain )
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
	( useShoppingCart as Mock ).mockReturnValue( {
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
		vi.mocked( CheckoutMain ).mockClear();
	} );

	it( 'hides Back while the prepared cart loads even if products are available', () => {
		mockCart( { isLoading: true, products: [ pressableProduct ] } );
		const { container } = renderPrepared();

		expect( container.querySelector( '.client-checkout-placeholder' ) ).toBeInTheDocument();
		expect( screen.queryByTestId( 'checkout-main' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Back to Pressable' ) ).not.toBeInTheDocument();
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
		expect( screen.queryByText( 'Back to Pressable' ) ).not.toBeInTheDocument();
	} );

	it( 'shows the error card and hides Back when the prepared cart fails to load', () => {
		mockCart( { loadingError: 'boom', products: [ pressableProduct ] } );
		const { container } = renderPrepared();

		expect( screen.getByText( 'Unable to load your prepared order.' ) ).toBeInTheDocument();
		expect( container.querySelector( '.client-checkout-placeholder' ) ).not.toBeInTheDocument();
		expect( screen.queryByTestId( 'checkout-main' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Back to Pressable' ) ).not.toBeInTheDocument();
	} );

	it( 'uses the signed success destination and renders cancellation as an unchanged link', () => {
		mockCart( { products: [ pressableProduct ] } );
		renderPrepared();

		expect( vi.mocked( CheckoutMain ).mock.calls.at( -1 )?.[ 0 ].redirectTo ).toBe( successUrl );
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

	it( 'does not use Pressable navigation for ordinary prepared carts', () => {
		mockCart( { products: [ { extra: { isA4ASitelessCheckout: true, agency_id: 42 } } ] } );
		renderPrepared();

		expect( vi.mocked( CheckoutMain ).mock.calls.at( -1 )?.[ 0 ].redirectTo ).toBe(
			`${ window.location.origin }/purchases/licenses`
		);
		expect( screen.queryByText( 'Back to Pressable' ) ).not.toBeInTheDocument();
	} );
} );
