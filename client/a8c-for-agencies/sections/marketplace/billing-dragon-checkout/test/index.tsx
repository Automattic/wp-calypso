/**
 * @jest-environment jsdom
 */
import { useShoppingCart } from '@automattic/shopping-cart';
import { render, screen } from '@testing-library/react';
import BillingDragonCheckout from '..';
import { getReturnRequest } from '../../pressable-return/lib';
import type { ReactNode } from 'react';

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

jest.mock( 'calypso/state/a8c-for-agencies/agency/selectors', () => ( {
	getActiveAgency: () => ( { id: 42 } ),
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
jest.mock(
	'calypso/my-sites/checkout/src/components/checkout-main',
	() => ( props: { redirectTo: string; customizedPreviousPath: string } ) => (
		<div
			data-testid="checkout-main"
			data-success-path={ props.redirectTo }
			data-cancel-path={ props.customizedPreviousPath }
		/>
	)
);

const replaceProductsInCart = jest.fn();

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
		window.sessionStorage.clear();
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

	const originalUrl =
		'https://my.pressable.com/titan_email/checkout_return?agency_id=42&domain=example.com&signature=original';
	const titanExtra = {
		isA4ASitelessCheckout: true,
		agency_id: 42,
		titan_domain: 'example.com',
		titan_plan: 'standard',
		afterPurchaseUrl: originalUrl,
	};

	it( 'uses internal success and cancellation paths for a Pressable-prepared Titan cart', () => {
		mockCart( { products: [ { extra: titanExtra } ] } );
		renderPrepared();

		expect( screen.getByTestId( 'checkout-main' ) ).toHaveAttribute(
			'data-success-path',
			'https://example.com/marketplace/pressable-return?agency_id=42&receipt_id=:receiptId'
		);
		expect( screen.getByTestId( 'checkout-main' ) ).toHaveAttribute(
			'data-cancel-path',
			'/marketplace/pressable-return?agency_id=42&canceled=1'
		);
		expect( replaceProductsInCart ).not.toHaveBeenCalled();
	} );

	it( 'preserves the original URL when removing the last item clears the cart', () => {
		mockCart( { products: [ { extra: titanExtra } ] } );
		const { rerender } = renderPrepared();
		mockCart( { products: [] } );
		rerender( <BillingDragonCheckout cartItems={ [] } skipActiveCart withA8cLogo={ false } /> );

		expect( getReturnRequest( { agencyId: '42', canceled: '1' } ) ).toEqual( {
			agency_id: 42,
			checkout_status: 'CANCELED',
			afterPurchaseUrl: originalUrl,
		} );
	} );

	it( 'leaves ordinary prepared checkout unchanged and clears stale cancellation context', () => {
		mockCart( { products: [ { extra: titanExtra } ] } );
		const { rerender } = renderPrepared();
		mockCart( { products: [ { extra: { isA4ASitelessCheckout: true, agency_id: 42 } } ] } );
		rerender( <BillingDragonCheckout cartItems={ [] } skipActiveCart withA8cLogo={ false } /> );

		expect( screen.getByTestId( 'checkout-main' ) ).toHaveAttribute(
			'data-success-path',
			'https://example.com/purchases/licenses'
		);
		expect( screen.getByTestId( 'checkout-main' ) ).toHaveAttribute(
			'data-cancel-path',
			'/marketplace'
		);
		expect( () => getReturnRequest( { agencyId: '42', canceled: '1' } ) ).toThrow();
	} );
} );
