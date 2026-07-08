/**
 * @jest-environment jsdom
 */

// Mock module dependencies before importing the hook so the mocks are wired
// up when the hook's module evaluates its imports.
jest.mock( '../../../use-cart-key', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

jest.mock( '../../hooks/use-valid-checkout-back-url', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

jest.mock( '../../lib/leave-checkout', () => ( {
	__esModule: true,
	leaveCheckout: jest.fn(),
} ) );

jest.mock( 'calypso/state/analytics/actions', () => ( {
	recordTracksEvent: () => ( { type: 'NOOP_RECORD_TRACKS_EVENT' } ),
} ) );

import {
	createShoppingCartManagerClient,
	getEmptyResponseCart,
	getEmptyResponseCartProduct,
	ShoppingCartProvider,
} from '@automattic/shopping-cart';
import { act, renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import useCartKey from '../../../use-cart-key';
import useValidCheckoutBackUrl from '../../hooks/use-valid-checkout-back-url';
import { leaveCheckout } from '../../lib/leave-checkout';
import { useCheckoutLeaveModal } from '../leave-checkout-modal';
import type {
	CartKey,
	GetCart,
	RequestCart,
	ResponseCart,
	ResponseCartProduct,
	SetCart,
} from '@automattic/shopping-cart';
import type { ReactNode } from 'react';

const NEW_SITE_CART_KEY: CartKey = 1234;
const NEW_SITE_SLUG = 'mynewsite.wordpress.com';

const domainProduct: ResponseCartProduct = {
	...getEmptyResponseCartProduct(),
	product_slug: 'dotcom_domain',
	product_id: 6,
	product_name: 'example.com',
	meta: 'example.com',
	uuid: 'domain-001',
	is_domain_registration: true,
};

const planProduct: ResponseCartProduct = {
	...getEmptyResponseCartProduct(),
	product_slug: 'personal-bundle',
	product_id: 1009,
	product_name: 'WordPress.com Personal',
	uuid: 'plan-001',
};

function createFakeCartBackend(
	initialCarts: Partial< Record< CartKey, ResponseCartProduct[] > >
) {
	const carts = new Map< CartKey, ResponseCart >();
	for ( const [ key, products ] of Object.entries( initialCarts ) ) {
		const cartKey = ( isNaN( Number( key ) ) ? key : Number( key ) ) as CartKey;
		carts.set( cartKey, {
			...getEmptyResponseCart(),
			cart_key: cartKey,
			products: products ?? [],
		} );
	}

	const setCallsByKey: CartKey[] = [];

	const getCart: GetCart = async ( cartKey ) => {
		const existing = carts.get( cartKey );
		if ( existing ) {
			return existing;
		}
		const emptyCart: ResponseCart = {
			...getEmptyResponseCart(),
			cart_key: cartKey,
			products: [],
		};
		carts.set( cartKey, emptyCart );
		return emptyCart;
	};

	const setCart: SetCart = async ( cartKey, newCart: RequestCart ) => {
		setCallsByKey.push( cartKey );
		const updated: ResponseCart = {
			...getEmptyResponseCart(),
			cart_key: cartKey,
			products: newCart.products.map(
				( requested ) =>
					( {
						...getEmptyResponseCartProduct(),
						product_id: requested.product_id,
						product_slug: requested.product_slug,
						meta: requested.meta ?? '',
					} ) as ResponseCartProduct
			),
		};
		carts.set( cartKey, updated );
		return updated;
	};

	return { getCart, setCart, carts, setCallsByKey };
}

function createMinimalStore() {
	const initialState = {
		route: {
			path: { previous: '' },
			query: { previous: {}, initial: {} },
		},
		currentUser: { id: 1, user: { ID: 1 } },
		ui: { selectedSiteId: null },
		sites: { items: {} },
	};
	return createStore( ( state = initialState ) => state );
}

function buildWrapper( client: ReturnType< typeof createShoppingCartManagerClient > ) {
	const store = createMinimalStore();
	return function Wrapper( { children }: { children: ReactNode } ) {
		return (
			<Provider store={ store }>
				<ShoppingCartProvider managerClient={ client }>{ children }</ShoppingCartProvider>
			</Provider>
		);
	};
}

describe( 'useCheckoutLeaveModal.clearCartAndLeave', () => {
	beforeEach( () => {
		( useCartKey as jest.Mock ).mockReset();
		( useValidCheckoutBackUrl as jest.Mock ).mockReset();
		( leaveCheckout as jest.Mock ).mockReset();
		( useCartKey as jest.Mock ).mockReturnValue( NEW_SITE_CART_KEY );
		( useValidCheckoutBackUrl as jest.Mock ).mockReturnValue(
			'/start/domain/domain-only?skippedCheckout=1'
		);
	} );

	it( 'flushes every cart-clear request before navigating away', async () => {
		// Reproduces the /start/domain "New site" leftover-cart bug:
		//
		// 1. /start/domain/domain-only adds a domain to the `'no-site'` cart.
		// 2. Picking "New site" creates a fresh site; checkout opens against
		//    that new site's cart with the same domain + a plan.
		// 3. Clicking the masterbar close → "Empty cart" should clear every
		//    cart involved, then redirect back to the signup origin.
		//
		// In production `closeAndLeave` triggers a hard navigation
		// (`window.location.href = ...`) that cancels any in-flight or queued
		// cart-clear POSTs. `replaceProductsInCart` is async — it debounces
		// the POST via `setTimeout` and resolves only after the server
		// confirms. If `clearCartAndLeave` does not await every replace call
		// before invoking `closeAndLeave`, the navigation lands before the
		// POSTs are sent and the leftover products reappear on the signup
		// origin.
		//
		// Assertion captures the cart-clear state at the exact moment
		// `leaveCheckout` is invoked, which is the boundary where navigation
		// would start in production. With the correct implementation, all
		// three carts have been written by that point.

		const { getCart, setCart, carts, setCallsByKey } = createFakeCartBackend( {
			'no-site': [ domainProduct ],
			[ NEW_SITE_CART_KEY ]: [ domainProduct, planProduct ],
		} );
		const client = createShoppingCartManagerClient( { getCart, setCart } );
		const Wrapper = buildWrapper( client );

		let cartsWrittenAtLeaveTime: CartKey[] = [];
		( leaveCheckout as jest.Mock ).mockImplementation( () => {
			cartsWrittenAtLeaveTime = [ ...setCallsByKey ];
		} );

		const { result } = renderHook( () => useCheckoutLeaveModal( { siteUrl: NEW_SITE_SLUG } ), {
			wrapper: Wrapper,
		} );

		// Wait until the active checkout cart has been hydrated so the hook
		// sees a populated cart before acting on it.
		await waitFor( () =>
			expect(
				client.forCartKey( NEW_SITE_CART_KEY ).getState().responseCart.products
			).toHaveLength( 2 )
		);

		await act( async () => {
			await result.current.clearCartAndLeave();
		} );

		expect( leaveCheckout ).toHaveBeenCalledTimes( 1 );
		expect( leaveCheckout ).toHaveBeenCalledWith(
			expect.objectContaining( { userHasClearedCart: true } )
		);

		// Core regression assertion: at the moment we hand control to
		// `leaveCheckout` (i.e. when the production navigation would fire),
		// every cart involved must already have been cleared on the server.
		expect( cartsWrittenAtLeaveTime.sort() ).toEqual(
			[ NEW_SITE_CART_KEY, 'no-site', 'no-user' ].sort()
		);

		expect( carts.get( 'no-site' )?.products ).toHaveLength( 0 );
		expect( carts.get( 'no-user' )?.products ).toHaveLength( 0 );
		expect( carts.get( NEW_SITE_CART_KEY )?.products ).toHaveLength( 0 );
	} );

	it( 'redirects to the domains back URL when one is supplied', async () => {
		// A flow that provides `checkoutBackUrlDomains` (e.g. AI Site Builder
		// onboarding) wants emptying the cart to return the user to the domain
		// step rather than the default plan-step back URL.
		( useValidCheckoutBackUrl as jest.Mock ).mockImplementation(
			( _siteSlug: string, _siteId: number | undefined, queryArgName = 'checkoutBackUrl' ) =>
				queryArgName === 'checkoutBackUrlDomains'
					? 'https://mynewsite.wordpress.com/setup/ai-site-builder-onboarding/domains'
					: 'https://mynewsite.wordpress.com/setup/ai-site-builder-onboarding/plans'
		);

		const { getCart, setCart } = createFakeCartBackend( {
			[ NEW_SITE_CART_KEY ]: [ domainProduct, planProduct ],
		} );
		const client = createShoppingCartManagerClient( { getCart, setCart } );
		const Wrapper = buildWrapper( client );

		const { result } = renderHook( () => useCheckoutLeaveModal( { siteUrl: NEW_SITE_SLUG } ), {
			wrapper: Wrapper,
		} );

		await waitFor( () =>
			expect(
				client.forCartKey( NEW_SITE_CART_KEY ).getState().responseCart.products
			).toHaveLength( 2 )
		);

		await act( async () => {
			await result.current.clearCartAndLeave();
		} );

		expect( leaveCheckout ).toHaveBeenCalledWith(
			expect.objectContaining( {
				userHasClearedCart: true,
				forceCheckoutBackUrl:
					'https://mynewsite.wordpress.com/setup/ai-site-builder-onboarding/domains',
			} )
		);
	} );

	it( 'skips the redundant siteless clears when checkout is already on a siteless cart', async () => {
		// When the user is checking out directly against `'no-site'` (no
		// "New site" branch involved), the hook must not re-clear the same
		// cart twice. Only one POST per distinct cart key should fire.
		( useCartKey as jest.Mock ).mockReturnValue( 'no-site' );

		const { getCart, setCart, setCallsByKey } = createFakeCartBackend( {
			'no-site': [ domainProduct ],
		} );
		const client = createShoppingCartManagerClient( { getCart, setCart } );
		const Wrapper = buildWrapper( client );

		const { result } = renderHook( () => useCheckoutLeaveModal( { siteUrl: NEW_SITE_SLUG } ), {
			wrapper: Wrapper,
		} );

		await waitFor( () =>
			expect( client.forCartKey( 'no-site' ).getState().responseCart.products ).toHaveLength( 1 )
		);

		await act( async () => {
			await result.current.clearCartAndLeave();
		} );

		expect( leaveCheckout ).toHaveBeenCalledTimes( 1 );

		const noSiteWrites = setCallsByKey.filter( ( key ) => key === 'no-site' );
		expect( noSiteWrites ).toHaveLength( 1 );
		// `'no-user'` is still cleared defensively because it can hold pre-login
		// products that survive the login transition.
		expect( setCallsByKey ).toContain( 'no-user' );
	} );
} );

describe( 'useCheckoutLeaveModal.clickStepBack', () => {
	beforeEach( () => {
		( useCartKey as jest.Mock ).mockReset();
		( useValidCheckoutBackUrl as jest.Mock ).mockReset();
		( leaveCheckout as jest.Mock ).mockReset();
		( useCartKey as jest.Mock ).mockReturnValue( NEW_SITE_CART_KEY );
		( useValidCheckoutBackUrl as jest.Mock ).mockReturnValue(
			'https://mynewsite.wordpress.com/setup/onboarding/plans'
		);
	} );

	it( 'leaves directly to the step destination when the cart is empty', async () => {
		const { getCart, setCart } = createFakeCartBackend( { [ NEW_SITE_CART_KEY ]: [] } );
		const client = createShoppingCartManagerClient( { getCart, setCart } );
		const Wrapper = buildWrapper( client );

		const { result } = renderHook( () => useCheckoutLeaveModal( { siteUrl: NEW_SITE_SLUG } ), {
			wrapper: Wrapper,
		} );

		await act( async () => {
			result.current.clickStepBack( 'https://mynewsite.wordpress.com/setup/onboarding/domains' );
		} );

		expect( leaveCheckout ).toHaveBeenCalledWith(
			expect.objectContaining( {
				forceCheckoutBackUrl: 'https://mynewsite.wordpress.com/setup/onboarding/domains',
			} )
		);
		expect( result.current.isModalVisible ).toBe( false );
	} );

	it( 'opens the modal when the cart has products, then leaves to the step destination', async () => {
		const { getCart, setCart } = createFakeCartBackend( {
			[ NEW_SITE_CART_KEY ]: [ domainProduct, planProduct ],
		} );
		const client = createShoppingCartManagerClient( { getCart, setCart } );
		const Wrapper = buildWrapper( client );

		const { result } = renderHook( () => useCheckoutLeaveModal( { siteUrl: NEW_SITE_SLUG } ), {
			wrapper: Wrapper,
		} );

		await waitFor( () =>
			expect(
				client.forCartKey( NEW_SITE_CART_KEY ).getState().responseCart.products
			).toHaveLength( 2 )
		);

		act( () => {
			result.current.clickStepBack( 'https://mynewsite.wordpress.com/setup/onboarding/domains' );
		} );

		expect( result.current.isModalVisible ).toBe( true );
		expect( leaveCheckout ).not.toHaveBeenCalled();

		await act( async () => {
			result.current.closeAndLeave();
		} );

		expect( leaveCheckout ).toHaveBeenCalledWith(
			expect.objectContaining( {
				forceCheckoutBackUrl: 'https://mynewsite.wordpress.com/setup/onboarding/domains',
			} )
		);
	} );

	it( 'does not leak the step-back URL into a later plain close', async () => {
		// Regression: clicking a step opens the modal and stores the step-back
		// URL. If the user dismisses that modal (no navigation) and later hits
		// the plain close button, the close must use the default back URL — not
		// the stale step-back URL from the earlier `clickStepBack`.
		const { getCart, setCart } = createFakeCartBackend( {
			[ NEW_SITE_CART_KEY ]: [ domainProduct, planProduct ],
		} );
		const client = createShoppingCartManagerClient( { getCart, setCart } );
		const Wrapper = buildWrapper( client );

		const { result } = renderHook( () => useCheckoutLeaveModal( { siteUrl: NEW_SITE_SLUG } ), {
			wrapper: Wrapper,
		} );

		await waitFor( () =>
			expect(
				client.forCartKey( NEW_SITE_CART_KEY ).getState().responseCart.products
			).toHaveLength( 2 )
		);

		// Step back to domains opens the modal and records the step URL.
		act( () => {
			result.current.clickStepBack( 'https://mynewsite.wordpress.com/setup/onboarding/domains' );
		} );
		expect( result.current.isModalVisible ).toBe( true );

		// User dismisses the modal without confirming (no navigation).
		act( () => {
			result.current.setIsModalVisible( false );
		} );

		// Plain close re-opens the modal; confirming must use the default back
		// URL, not the stale domains step URL.
		act( () => {
			result.current.clickClose();
		} );
		expect( result.current.isModalVisible ).toBe( true );

		await act( async () => {
			result.current.closeAndLeave();
		} );

		// Exactly one navigation must fire, with the default URL. Asserting the
		// call count closes the loophole where an erroneous earlier leave with
		// the stale step URL would still satisfy a bare `toHaveBeenCalledWith`.
		expect( leaveCheckout ).toHaveBeenCalledTimes( 1 );
		expect( leaveCheckout ).toHaveBeenCalledWith(
			expect.objectContaining( {
				forceCheckoutBackUrl: 'https://mynewsite.wordpress.com/setup/onboarding/plans',
			} )
		);
	} );
} );
