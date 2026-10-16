/**
 * @jest-environment jsdom
 * @jest-environment-options {"url":"http://agencies.localhost:3000"}
 */
import {
	getEmptyResponseCart,
	getEmptyResponseCartProduct,
	useShoppingCart,
} from '@automattic/shopping-cart';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { navigate } from 'calypso/lib/navigate';
import wpcom from 'calypso/lib/wp';
import useClientCheckout from '../../../hooks/use-client-checkout';
import ClientCheckoutV2 from '../index';
import type { ReactNode } from 'react';

jest.mock( '@automattic/calypso-stripe', () => ( {
	StripeHookProvider: ( { children }: { children: ReactNode } ) => children,
} ) );
jest.mock( '@automattic/composite-checkout', () => ( {
	CheckoutErrorBoundary: ( { children }: { children: ReactNode } ) => children,
} ) );
jest.mock(
	'calypso/my-sites/checkout/calypso-shopping-cart-provider',
	() =>
		( { children }: { children: ReactNode } ) =>
			children
);
jest.mock( 'calypso/my-sites/checkout/checkout-query-client-provider', () => {
	const { QueryClient, QueryClientProvider } = jest.requireActual( '@tanstack/react-query' );
	const { useState } = jest.requireActual( 'react' );
	return ( { children }: { children: ReactNode } ) => {
		const [ client ] = useState( () => new QueryClient() );
		return <QueryClientProvider client={ client }>{ children }</QueryClientProvider>;
	};
} );
jest.mock( 'calypso/a8c-for-agencies/components/a4a-logo', () => () => null );
jest.mock( 'calypso/state', () => ( { useSelector: () => 'en', useDispatch: () => jest.fn() } ) );
jest.mock( 'calypso/state/analytics/actions', () => ( { recordTracksEvent: jest.fn() } ) );
jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: { req: { post: jest.fn() } },
} ) );
jest.mock( '@automattic/shopping-cart', () => ( {
	...jest.requireActual( '@automattic/shopping-cart' ),
	useShoppingCart: jest.fn(),
} ) );
jest.mock( 'calypso/my-sites/checkout/use-cart-key', () => () => 'no-site' );
jest.mock(
	'calypso/my-sites/checkout/src/hooks/use-valid-checkout-back-url',
	() => () => undefined
);
jest.mock( 'calypso/lib/navigate', () => ( { navigate: jest.fn() } ) );
jest.mock( 'calypso/lib/analytics/tracks', () => ( { recordTracksEvent: jest.fn() } ) );
jest.mock( 'calypso/signup/storageUtils', () => ( {
	getSignupCompleteFlowName: () => undefined,
} ) );
jest.mock( '../../../hooks/use-client-checkout', () => jest.fn() );
jest.mock( '../../../checkout-v2-error', () => ( { message }: { message: ReactNode } ) => (
	<div role="alert">{ message }</div>
) );
jest.mock( '../../../checkout-v2-placeholder', () => () => <div data-testid="loading" /> );
jest.mock( 'calypso/my-sites/checkout/src/components/checkout-main', () => {
	const useRemoveFromCartAndRedirect = jest.requireActual(
		'calypso/my-sites/checkout/src/hooks/use-remove-from-cart-and-redirect'
	).default;
	return ( props: { redirectTo: string; customizedPreviousPath: string } ) => {
		const { removeProductFromCartAndMaybeRedirect } = useRemoveFromCartAndRedirect(
			'',
			false,
			props.customizedPreviousPath
		);
		return (
			<div
				data-testid="checkout"
				data-redirect={ props.redirectTo }
				data-previous={ props.customizedPreviousPath }
			>
				<button onClick={ () => removeProductFromCartAndMaybeRedirect( 'uuid' ) }>Remove</button>
			</div>
		);
	};
} );

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
			'https://my.pressable.com/titan_email/checkout_return?agency_id=42-cli-7&email=client%40example.com&domain=example.com&quantity=2&signature=original',
	},
};

const post = wpcom.req.post as jest.Mock;
const assign = jest.fn();
const originalLocation = window.location;
const signedUrl = `${ product.extra.afterPurchaseUrl }&checkout_status=CANCELED&timestamp=123`;
const checkoutState = {
	isReady: true,
	error: null,
	emailMismatchWithReferralClient: false,
	referral: { client: { email: 'client@example.com' } },
	products: [ product ],
	preparedCartContext: { agencyId: 42, referralId: 99, clientId: 7 },
};

beforeAll( () => {
	Object.defineProperty( window, 'location', {
		value: {
			origin: originalLocation.origin,
			href: `${ originalLocation.origin }/client/checkout/v2?skip_active_cart=1`,
			search: '?skip_active_cart=1',
			assign,
		},
		configurable: true,
	} );
} );
afterAll( () => {
	Object.defineProperty( window, 'location', { value: originalLocation, configurable: true } );
} );
beforeEach( () => {
	jest.clearAllMocks();
	post.mockReset();
	( useShoppingCart as jest.Mock ).mockReturnValue( { removeProductFromCart: jest.fn() } );
	( useClientCheckout as jest.Mock ).mockReturnValue( checkoutState );
} );

it( 'uses client SUCCESS and signs CANCELED only after clicking Back with the original URL', async () => {
	post.mockResolvedValue( { afterPurchaseUrl: signedUrl } );
	render( <ClientCheckoutV2 skipActiveCart /> );
	expect( screen.getByTestId( 'checkout' ) ).toHaveAttribute(
		'data-redirect',
		'http://agencies.localhost:3000/client/pressable-return?agency_id=42&referral_id=99&receipt_id=:receiptId'
	);
	expect( screen.getByTestId( 'checkout' ) ).toHaveAttribute(
		'data-previous',
		'/client/subscriptions'
	);
	expect( post ).not.toHaveBeenCalled();
	fireEvent.click( screen.getByRole( 'button', { name: 'Back to Pressable' } ) );
	await waitFor( () => expect( assign ).toHaveBeenCalledWith( signedUrl ) );
	expect( post ).toHaveBeenCalledWith( {
		apiNamespace: 'wpcom/v2',
		path: '/agency/pressable/titan-checkout-return',
		method: 'POST',
		body: {
			agency_id: 42,
			checkout_status: 'CANCELED',
			afterPurchaseUrl: product.extra.afterPurchaseUrl,
		},
	} );
} );

it( 'keeps Back and the original signed URL after this checkout reports an error', async () => {
	post.mockResolvedValue( { afterPurchaseUrl: signedUrl } );
	const { rerender } = render( <ClientCheckoutV2 skipActiveCart /> );
	( useClientCheckout as jest.Mock ).mockReturnValue( {
		...checkoutState,
		isReady: false,
		error: 'Unable to load your prepared order.',
		products: [],
	} );
	rerender( <ClientCheckoutV2 skipActiveCart /> );
	expect( screen.getByRole( 'alert' ) ).toHaveTextContent( 'Unable to load your prepared order.' );
	expect( screen.queryByTestId( 'checkout' ) ).not.toBeInTheDocument();
	expect( post ).not.toHaveBeenCalled();
	fireEvent.click( screen.getByRole( 'button', { name: 'Back to Pressable' } ) );
	await waitFor( () => expect( assign ).toHaveBeenCalledWith( signedUrl ) );
	expect( post.mock.calls[ 0 ][ 0 ].body.afterPurchaseUrl ).toBe( product.extra.afterPurchaseUrl );
} );

it( 'retries client cancellation with a fresh signing request after failure', async () => {
	post
		.mockRejectedValueOnce( new Error( 'Unavailable.' ) )
		.mockResolvedValueOnce( { afterPurchaseUrl: signedUrl } );
	const { container } = render( <ClientCheckoutV2 skipActiveCart /> );
	fireEvent.click( screen.getByRole( 'button', { name: 'Back to Pressable' } ) );
	await within( container ).findByText( 'We couldn’t return you to Pressable. Please try again.' );
	expect( assign ).not.toHaveBeenCalled();
	fireEvent.click( screen.getByRole( 'button', { name: 'Back to Pressable' } ) );
	await waitFor( () => expect( assign ).toHaveBeenCalledWith( signedUrl ) );
	expect( post ).toHaveBeenCalledTimes( 2 );
	expect( post.mock.calls[ 1 ][ 0 ].body.afterPurchaseUrl ).toBe( product.extra.afterPurchaseUrl );
} );

it( 'denies the wrong account even after valid return context was retained', () => {
	const { rerender } = render( <ClientCheckoutV2 skipActiveCart /> );
	( useClientCheckout as jest.Mock ).mockReturnValue( {
		...checkoutState,
		isReady: false,
		emailMismatchWithReferralClient: true,
	} );
	rerender( <ClientCheckoutV2 skipActiveCart /> );
	expect( screen.getByRole( 'alert' ) ).toHaveTextContent(
		'This referral is not intended for your account.'
	);
	expect( screen.queryByTestId( 'checkout' ) ).not.toBeInTheDocument();
	expect( screen.queryByRole( 'button', { name: 'Back to Pressable' } ) ).not.toBeInTheDocument();
	expect( post ).not.toHaveBeenCalled();
} );

it( 'uses normal subscriptions navigation after last-item removal without signing cancellation', async () => {
	let completeRemoval: ( cart: ReturnType< typeof getEmptyResponseCart > ) => void = () => {};
	const removeProductFromCart = jest.fn(
		() =>
			new Promise( ( resolve ) => {
				completeRemoval = resolve;
			} )
	);
	( useShoppingCart as jest.Mock ).mockReturnValue( { removeProductFromCart } );
	const { rerender } = render( <ClientCheckoutV2 skipActiveCart /> );
	fireEvent.click( screen.getByRole( 'button', { name: 'Remove' } ) );
	( useClientCheckout as jest.Mock ).mockReturnValue( {
		...checkoutState,
		isReady: false,
		error: 'We could not find your prepared order.',
		products: [],
	} );
	rerender( <ClientCheckoutV2 skipActiveCart /> );
	expect( screen.queryByTestId( 'checkout' ) ).not.toBeInTheDocument();
	await act( async () => completeRemoval( getEmptyResponseCart() ) );
	expect( removeProductFromCart ).toHaveBeenCalledWith( 'uuid' );
	expect( navigate ).toHaveBeenCalledWith( '/client/subscriptions' );
	expect( post ).not.toHaveBeenCalled();
	expect( assign ).not.toHaveBeenCalled();
} );

it( 'renders a prepared cart load failure without a stale Back action on a fresh mount', () => {
	( useClientCheckout as jest.Mock ).mockReturnValue( {
		...checkoutState,
		isReady: false,
		error: 'Unable to load your prepared order.',
		products: [],
	} );
	render( <ClientCheckoutV2 skipActiveCart /> );
	expect( screen.getByRole( 'alert' ) ).toHaveTextContent( 'Unable to load your prepared order.' );
	expect( screen.queryByTestId( 'loading' ) ).not.toBeInTheDocument();
	expect( screen.queryByTestId( 'checkout' ) ).not.toBeInTheDocument();
	expect( screen.queryByRole( 'button', { name: 'Back to Pressable' } ) ).not.toBeInTheDocument();
} );

it( 'retains subscriptions navigation for ordinary referral checkout without a Pressable action', () => {
	render( <ClientCheckoutV2 /> );
	expect( screen.getByTestId( 'checkout' ) ).toHaveAttribute(
		'data-redirect',
		'http://agencies.localhost:3000/client/subscriptions?client_purchase_completed=true'
	);
	expect( screen.getByTestId( 'checkout' ) ).toHaveAttribute(
		'data-previous',
		'/client/subscriptions'
	);
	expect( screen.queryByRole( 'button', { name: 'Back to Pressable' } ) ).not.toBeInTheDocument();
	expect( post ).not.toHaveBeenCalled();
} );
