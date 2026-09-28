/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import BillingDragonCheckout from '../index';
import type { ReactNode } from 'react';

const mockReplaceProductsInCart = jest.fn( () => Promise.resolve() );
const mockDispatch = jest.fn();

let mockCart: {
	isLoading: boolean;
	isPendingUpdate: boolean;
	responseCart: { products: Array< { product_id: number; quantity: number | null } > };
};

jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( text: string ) => text,
	translate: ( text: string ) => text,
	localize: ( component: unknown ) => component,
} ) );

jest.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
	useSelector: ( selector: ( state: unknown ) => unknown ) => selector( {} ),
} ) );

jest.mock( 'calypso/state/analytics/actions', () => ( {
	recordTracksEvent: jest.fn( ( name, properties ) => ( {
		type: 'RECORD_TRACKS_EVENT',
		name,
		properties,
	} ) ),
} ) );

jest.mock( 'calypso/state/a8c-for-agencies/agency/selectors', () => ( {
	getActiveAgency: () => ( { id: 256533027 } ),
} ) );
jest.mock( 'calypso/state/current-user/selectors', () => ( {
	getCurrentUserLocale: () => 'en',
} ) );
jest.mock( 'calypso/state/selectors/has-loaded-sites', () => () => true );
jest.mock( 'calypso/state/sites/selectors/get-site', () => () => undefined );
jest.mock( 'calypso/state/ui/actions', () => ( {
	setSelectedSiteId: ( id: number | null ) => ( { type: 'SET_SELECTED_SITE_ID', id } ),
} ) );

jest.mock( '@automattic/shopping-cart', () => ( {
	useShoppingCart: () => ( {
		replaceProductsInCart: mockReplaceProductsInCart,
		...mockCart,
	} ),
	createRequestCartProduct: ( product: unknown ) => product,
} ) );

jest.mock( '@automattic/composite-checkout', () => ( {
	CheckoutErrorBoundary: ( { children }: { children: ReactNode } ) => <div>{ children }</div>,
} ) );
jest.mock( '@automattic/calypso-stripe', () => ( {
	StripeHookProvider: ( { children }: { children: ReactNode } ) => <div>{ children }</div>,
} ) );
jest.mock( 'calypso/lib/store-transactions', () => ( { getStripeConfiguration: jest.fn() } ) );
jest.mock( 'calypso/my-sites/checkout/calypso-shopping-cart-provider', () => ( {
	__esModule: true,
	default: ( { children }: { children: ReactNode } ) => <div>{ children }</div>,
} ) );
jest.mock( 'calypso/my-sites/checkout/src/components/checkout-main', () => ( {
	__esModule: true,
	default: () => <div data-testid="checkout-main" />,
} ) );
jest.mock( 'calypso/my-sites/checkout/src/hooks/use-prepare-products-for-cart', () => ( {
	__esModule: true,
	default: () => ( { productsForCart: [], isLoading: false, error: null } ),
} ) );
jest.mock( '../cart-message-cleanup', () => ( {
	__esModule: true,
	default: () => null,
} ) );
jest.mock( 'calypso/a8c-for-agencies/components/a4a-logo', () => ( {
	__esModule: true,
	default: () => null,
} ) );

const mockedRecordTracksEvent = recordTracksEvent as jest.MockedFunction<
	typeof recordTracksEvent
>;

const TITAN = { product_id: 1234, quantity: 2 };
const NO_LONGER_AVAILABLE = 'This checkout is no longer available.';

describe( 'BillingDragonCheckout prepared mode', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.useFakeTimers();
		mockCart = { isLoading: true, isPendingUpdate: false, responseCart: { products: [] } };
	} );

	afterEach( () => jest.useRealTimers() );

	it( 'shows the placeholder while the server cart loads and never replaces the cart', () => {
		const { container, rerender } = render(
			<BillingDragonCheckout
				cartItems={ [] }
				preparedCart={ { products: [ TITAN ], source: 'pressable_titan' } }
			/>
		);
		expect( container.querySelector( '.client-checkout-placeholder' ) ).not.toBeNull();

		// The normal flow's 2s escape hatch must not fire in prepared mode.
		jest.advanceTimersByTime( 3000 );
		rerender(
			<BillingDragonCheckout
				cartItems={ [] }
				preparedCart={ { products: [ TITAN ], source: 'pressable_titan' } }
			/>
		);
		expect( screen.queryByTestId( 'checkout-main' ) ).toBeNull();
		expect( container.querySelector( '.client-checkout-placeholder' ) ).not.toBeNull();
		expect( mockReplaceProductsInCart ).not.toHaveBeenCalled();
	} );

	it( 'renders checkout once the loaded cart matches the expected products', async () => {
		mockCart = {
			isLoading: false,
			isPendingUpdate: false,
			responseCart: { products: [ { product_id: 1234, quantity: 2 } ] },
		};
		render(
			<BillingDragonCheckout
				cartItems={ [] }
				preparedCart={ { products: [ TITAN ], source: 'pressable_titan' } }
			/>
		);
		await waitFor( () => expect( screen.getByTestId( 'checkout-main' ) ).toBeVisible() );
		expect( mockReplaceProductsInCart ).not.toHaveBeenCalled();
	} );

	it( 'shows an error and records the event when the loaded cart is empty', async () => {
		mockCart = { isLoading: false, isPendingUpdate: false, responseCart: { products: [] } };
		render(
			<BillingDragonCheckout
				cartItems={ [] }
				preparedCart={ { products: [ TITAN ], source: 'pressable_titan' } }
			/>
		);
		await waitFor( () => expect( screen.getByText( NO_LONGER_AVAILABLE ) ).toBeVisible() );
		expect( screen.queryByTestId( 'checkout-main' ) ).toBeNull();
		expect( mockReplaceProductsInCart ).not.toHaveBeenCalled();
		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_marketplace_prepared_checkout_cart_invalid',
			{ source: 'pressable_titan', problem: 'empty' }
		);
	} );

	it( 'shows an error when the loaded cart does not match the expected products', async () => {
		mockCart = {
			isLoading: false,
			isPendingUpdate: false,
			responseCart: { products: [ { product_id: 9999, quantity: 1 } ] },
		};
		render(
			<BillingDragonCheckout
				cartItems={ [] }
				preparedCart={ { products: [ TITAN ], source: 'pressable_titan' } }
			/>
		);
		await waitFor( () => expect( screen.getByText( NO_LONGER_AVAILABLE ) ).toBeVisible() );
		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_marketplace_prepared_checkout_cart_invalid',
			{ source: 'pressable_titan', problem: 'mismatch' }
		);
	} );

	it( 'accepts any non-empty cart on reload when no expected products are known', async () => {
		mockCart = {
			isLoading: false,
			isPendingUpdate: false,
			responseCart: { products: [ { product_id: 9999, quantity: 1 } ] },
		};
		render( <BillingDragonCheckout cartItems={ [] } preparedCart={ { source: 'reload' } } /> );
		await waitFor( () => expect( screen.getByTestId( 'checkout-main' ) ).toBeVisible() );
	} );
} );
