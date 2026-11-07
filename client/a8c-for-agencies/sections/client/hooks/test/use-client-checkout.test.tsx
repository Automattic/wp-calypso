/**
 * @jest-environment jsdom
 */
import { getEmptyResponseCartProduct, useShoppingCart } from '@automattic/shopping-cart';
import { renderHook, waitFor } from '@testing-library/react';
import useProductsById from 'calypso/a8c-for-agencies/sections/marketplace/hooks/use-products-by-id';
import { useSelector } from 'calypso/state';
import useClientCheckout from '../use-client-checkout';
import useFetchClientReferral from '../use-fetch-client-referral';

jest.mock( '@automattic/shopping-cart', () => ( {
	...jest.requireActual( '@automattic/shopping-cart' ),
	useShoppingCart: jest.fn(),
} ) );
jest.mock( 'calypso/state', () => ( { useSelector: jest.fn() } ) );
jest.mock( '../use-fetch-client-referral' );
jest.mock( 'calypso/a8c-for-agencies/sections/marketplace/hooks/use-products-by-id' );
jest.mock( 'calypso/my-sites/checkout/src/lib/checkout-stores', () => ( {
	contactDetailsActions: { updateEmail: jest.fn() },
} ) );

const replaceProductsInCart = jest.fn();
const referral = { id: 99, client: { id: 7, email: 'client@example.com' }, products: [] };
const product = {
	...getEmptyResponseCartProduct(),
	product_id: 3262,
	quantity: 5,
	extra: {
		isA4ASitelessCheckout: true,
		agency_id: 42,
		referral_id: 99,
		titan_domain: 'example.com',
		titan_plan: 'standard',
		afterPurchaseUrl:
			'https://my.pressable.com/titan_email/checkout_return?agency_id=42-cli-7&checkout_status=SUCCESS&signature=a%2Bb%2fc%3D',
		pressableCancelUrl:
			'https://my.pressable.com/titan_email/checkout_return?agency_id=42-cli-7&checkout_status=CANCELED&signature=d%2Be%2ff%3D',
	},
};

beforeEach( () => {
	jest.clearAllMocks();
	window.history.replaceState(
		null,
		'',
		'/client/checkout/v2?agency_id=42&referral_id=99&client_id=123456&secret=internal&skip_active_cart=1'
	);
	( useSelector as jest.Mock ).mockReturnValue( referral.client.email );
	( useFetchClientReferral as jest.Mock ).mockReturnValue( {
		data: referral,
		isLoading: false,
		isError: false,
	} );
	( useProductsById as jest.Mock ).mockReturnValue( { referredProducts: [] } );
	replaceProductsInCart.mockResolvedValue( undefined );
	( useShoppingCart as jest.Mock ).mockReturnValue( {
		isLoading: false,
		loadingError: null,
		responseCart: { products: [ product ] },
		replaceProductsInCart,
	} );
} );

it( 'loads the saved client Titan cart using the referral client rather than the OAuth application ID', () => {
	const { result } = renderHook( () => useClientCheckout( { skipActiveCart: true } ) );
	expect( result.current.isReady ).toBe( true );
	expect( result.current.products[ 0 ] ).toBe( product );
	expect( result.current.products[ 0 ].quantity ).toBe( 5 );
	expect( result.current.preparedCartContext?.clientId ).toBe( 7 );
	expect( useProductsById ).toHaveBeenCalledWith( [], false );
	expect( replaceProductsInCart ).not.toHaveBeenCalled();
	expect( useShoppingCart ).toHaveBeenCalledWith( 'no-site' );
} );

it( 'blocks a different authenticated client without replacing their cart', () => {
	( useSelector as jest.Mock ).mockReturnValue( 'other@example.com' );
	const { result } = renderHook( () => useClientCheckout( { skipActiveCart: true } ) );
	expect( result.current.isReady ).toBe( false );
	expect( result.current.emailMismatchWithReferralClient ).toBe( true );
	expect( replaceProductsInCart ).not.toHaveBeenCalled();
} );

it( 'rejects a cart for another referral without rebuilding it', () => {
	( useShoppingCart as jest.Mock ).mockReturnValue( {
		isLoading: false,
		loadingError: null,
		responseCart: { products: [ { ...product, extra: { ...product.extra, referral_id: 98 } } ] },
		replaceProductsInCart,
	} );
	const { result } = renderHook( () => useClientCheckout( { skipActiveCart: true } ) );
	expect( result.current.isReady ).toBe( false );
	expect( result.current.error ).toBeTruthy();
	expect( replaceProductsInCart ).not.toHaveBeenCalled();
} );

it( 'waits for referral validation before displaying a saved cart', () => {
	( useFetchClientReferral as jest.Mock ).mockReturnValue( { isLoading: true, isError: false } );
	const { result } = renderHook( () => useClientCheckout( { skipActiveCart: true } ) );
	expect( result.current.isReady ).toBe( false );
	expect( result.current.error ).toBeNull();
	expect( replaceProductsInCart ).not.toHaveBeenCalled();
} );

it( 'reports a referral request failure without reconstructing products', () => {
	( useFetchClientReferral as jest.Mock ).mockReturnValue( { isLoading: false, isError: true } );
	const { result } = renderHook( () => useClientCheckout( { skipActiveCart: true } ) );
	expect( result.current.error ).toBe( 'Unable to load your prepared order.' );
	expect( replaceProductsInCart ).not.toHaveBeenCalled();
} );

it( 'preserves ordinary referral product construction without prepared mode', async () => {
	const referredProducts = [
		{ product_id: 100, alternative_product_id: 101, slug: 'ordinary-referral' },
	];
	( useProductsById as jest.Mock ).mockReturnValue( { referredProducts } );
	const { result } = renderHook( () => useClientCheckout( {} ) );
	await waitFor( () => expect( result.current.isReady ).toBe( true ) );
	expect( useProductsById ).toHaveBeenCalledWith( referral.products, true );
	expect( replaceProductsInCart ).toHaveBeenCalledWith( [
		expect.objectContaining( {
			product_id: 101,
			product_slug: 'ordinary-referral',
			extra: expect.objectContaining( {
				agency_id: '42',
				referral_id: '99',
				isA4ASitelessCheckout: true,
			} ),
		} ),
	] );
} );

it( 'keeps every license of a product the referral repeats', async () => {
	const license = { product_id: 100, alternative_product_id: 101, slug: 'ordinary-referral' };
	( useProductsById as jest.Mock ).mockReturnValue( {
		referredProducts: [ license, license, license ],
	} );
	const { result } = renderHook( () => useClientCheckout( {} ) );
	await waitFor( () => expect( result.current.isReady ).toBe( true ) );

	const [ lines ] = replaceProductsInCart.mock.calls[ 0 ];
	expect(
		lines.map( ( line: { extra: { cart_item_index: number } } ) => line.extra.cart_item_index )
	).toEqual( [ 0, 1, 2 ] );
} );
