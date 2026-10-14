/**
 * @jest-environment jsdom
 * @jest-environment-options {"url":"http://agencies.localhost:3000"}
 */
import {
	getEmptyResponseCart,
	getEmptyResponseCartProduct,
	useShoppingCart,
} from '@automattic/shopping-cart';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { navigate } from 'calypso/lib/navigate';
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
jest.mock(
	'calypso/my-sites/checkout/checkout-query-client-provider',
	() =>
		( { children }: { children: ReactNode } ) =>
			children
);
jest.mock( 'calypso/a8c-for-agencies/components/a4a-logo', () => () => null );
jest.mock( 'calypso/state', () => ( { useSelector: () => 'en' } ) );
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
			'https://my.pressable.com/titan_email/checkout_return?agency_id=42-cli-7&signature=original',
	},
};

beforeEach( () => {
	jest.clearAllMocks();
	window.sessionStorage.clear();
	( useShoppingCart as jest.Mock ).mockReturnValue( { removeProductFromCart: jest.fn() } );
	( useClientCheckout as jest.Mock ).mockReturnValue( {
		isReady: true,
		error: null,
		emailMismatchWithReferralClient: false,
		referral: { client: { email: 'client@example.com' } },
		products: [ product ],
		preparedCartContext: { agencyId: 42, referralId: 99, clientId: 7 },
	} );
} );

it( 'returns after last-item removal even when the empty prepared cart unmounts checkout', async () => {
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
		isReady: false,
		error: 'We could not find your prepared order.',
		products: [],
		preparedCartContext: { agencyId: 42, referralId: 99, clientId: 7 },
	} );
	rerender( <ClientCheckoutV2 skipActiveCart /> );
	expect( screen.queryByTestId( 'checkout' ) ).not.toBeInTheDocument();
	await act( async () => completeRemoval( getEmptyResponseCart() ) );
	expect( navigate ).toHaveBeenCalledWith(
		'/client/pressable-return?agency_id=42&referral_id=99&canceled=1'
	);
	expect( window.sessionStorage.getItem( 'a4a-pressable-return-42-referral-99' ) ).toBe(
		product.extra.afterPurchaseUrl
	);
} );

it( 'uses the client return route for success and the existing checkout back hook', () => {
	render( <ClientCheckoutV2 skipActiveCart /> );
	expect( screen.getByTestId( 'checkout' ) ).toHaveAttribute(
		'data-redirect',
		'http://agencies.localhost:3000/client/pressable-return?agency_id=42&referral_id=99&receipt_id=:receiptId'
	);
	expect( screen.getByTestId( 'checkout' ) ).toHaveAttribute(
		'data-previous',
		'/client/pressable-return?agency_id=42&referral_id=99&canceled=1'
	);
	expect( window.sessionStorage.getItem( 'a4a-pressable-return-42-referral-99' ) ).toBe(
		product.extra.afterPurchaseUrl
	);
} );

it( 'renders a prepared cart load failure before the placeholder', () => {
	( useClientCheckout as jest.Mock ).mockReturnValue( {
		isReady: false,
		error: 'Unable to load your prepared order.',
		products: [],
	} );
	render( <ClientCheckoutV2 skipActiveCart /> );
	expect( screen.getByRole( 'alert' ) ).toHaveTextContent( 'Unable to load your prepared order.' );
	expect( screen.queryByTestId( 'loading' ) ).not.toBeInTheDocument();
	expect( screen.queryByTestId( 'checkout' ) ).not.toBeInTheDocument();
} );

it( 'retains subscriptions navigation for ordinary referral checkout', () => {
	render( <ClientCheckoutV2 /> );
	expect( screen.getByTestId( 'checkout' ) ).toHaveAttribute(
		'data-redirect',
		'http://agencies.localhost:3000/client/subscriptions?client_purchase_completed=true'
	);
	expect( screen.getByTestId( 'checkout' ) ).toHaveAttribute(
		'data-previous',
		'/client/subscriptions'
	);
} );
