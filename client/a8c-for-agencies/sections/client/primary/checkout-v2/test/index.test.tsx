/**
 * @jest-environment jsdom
 * @jest-environment-options {"url":"http://agencies.localhost:3000"}
 */
import { getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { act, render, screen } from '@testing-library/react';
import CheckoutMain from 'calypso/my-sites/checkout/src/components/checkout-main';
import useClientCheckout from '../../../hooks/use-client-checkout';
import ClientCheckoutV2 from '../index';
import type { ReactNode } from 'react';

const passthrough = ( { children }: { children?: ReactNode } ) => <>{ children }</>;
jest.mock( '@automattic/calypso-stripe', () => ( { StripeHookProvider: passthrough } ) );
jest.mock( '@automattic/composite-checkout', () => ( { CheckoutErrorBoundary: passthrough } ) );
jest.mock( 'calypso/my-sites/checkout/calypso-shopping-cart-provider', () => passthrough );
jest.mock( 'calypso/my-sites/checkout/checkout-query-client-provider', () => passthrough );
jest.mock( 'calypso/a8c-for-agencies/components/a4a-logo', () => () => null );
jest.mock( 'calypso/state', () => ( { useSelector: () => 'en', useDispatch: () => jest.fn() } ) );
jest.mock( 'calypso/state/analytics/actions', () => ( { recordTracksEvent: jest.fn() } ) );
jest.mock( '../../../hooks/use-client-checkout', () => jest.fn() );
jest.mock( '../../../checkout-v2-error', () => ( { message }: { message: ReactNode } ) => (
	<div role="alert">{ message }</div>
) );
jest.mock( '../../../checkout-v2-placeholder', () => () => <div data-testid="loading" /> );
jest.mock( 'calypso/my-sites/checkout/src/components/checkout-main', () =>
	jest.fn( () => <div data-testid="checkout" /> )
);

const successUrl =
	'https://my.pressable.com/titan_email/checkout_return?agency_id=42-cli-7&checkout_status=SUCCESS&signature=a%2Bb%2fc%3D';
const cancelUrl =
	'https://my.pressable.com/titan_email/checkout_return?agency_id=42-cli-7&checkout_status=CANCELED&signature=d%2Be%2ff%3D';
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
		afterPurchaseUrl: successUrl,
		pressableCancelUrl: cancelUrl,
	},
};
const checkoutState = {
	isReady: true,
	error: null,
	emailMismatchWithReferralClient: false,
	referral: { client: { email: 'client@example.com' } },
	products: [ product ],
	preparedCartContext: { agencyId: 42, referralId: 99, clientId: 7 },
};

function setFormSubmitting( isFormSubmitting: boolean ) {
	act( () => {
		jest
			.mocked( CheckoutMain )
			.mock.calls.at( -1 )?.[ 0 ]
			.onFormSubmittingChange?.( isFormSubmitting );
	} );
}

beforeEach( () => {
	jest.clearAllMocks();
	( useClientCheckout as jest.Mock ).mockReturnValue( checkoutState );
} );

it( 'preserves both signed destinations and disables Back through the checkout submission callback', () => {
	render( <ClientCheckoutV2 skipActiveCart /> );
	expect( jest.mocked( CheckoutMain ).mock.calls.at( -1 )?.[ 0 ].redirectTo ).toBe( successUrl );
	expect( screen.getByRole( 'link', { name: 'Back to Pressable' } ) ).toHaveAttribute(
		'href',
		cancelUrl
	);

	setFormSubmitting( true );
	const back = screen.getByRole( 'button', { name: 'Back to Pressable' } );
	expect( back ).toBeDisabled();
	expect( back ).not.toHaveAttribute( 'href' );

	setFormSubmitting( false );
	expect( screen.getByRole( 'link', { name: 'Back to Pressable' } ) ).toHaveAttribute(
		'href',
		cancelUrl
	);
	expect( product.quantity ).toBe( 5 );
} );

it( 'hides Back while loading and after a prepared cart error without retaining its URL', () => {
	const { rerender } = render( <ClientCheckoutV2 skipActiveCart /> );
	( useClientCheckout as jest.Mock ).mockReturnValue( { ...checkoutState, isReady: false } );
	rerender( <ClientCheckoutV2 skipActiveCart /> );
	expect( screen.getByTestId( 'loading' ) ).toBeVisible();
	expect( screen.queryByTestId( 'checkout' ) ).not.toBeInTheDocument();
	expect( screen.queryByText( 'Back to Pressable' ) ).not.toBeInTheDocument();

	( useClientCheckout as jest.Mock ).mockReturnValue( {
		...checkoutState,
		isReady: false,
		error: 'Unable to load your prepared order.',
		products: [],
	} );
	rerender( <ClientCheckoutV2 skipActiveCart /> );
	expect( screen.getByRole( 'alert' ) ).toHaveTextContent( 'Unable to load your prepared order.' );
	expect( screen.queryByText( 'Back to Pressable' ) ).not.toBeInTheDocument();
} );

it( 'denies the wrong account after a valid prepared checkout was shown', () => {
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
	expect( screen.queryByText( 'Back to Pressable' ) ).not.toBeInTheDocument();
} );

it( 'retains subscriptions navigation for ordinary referrals without a Pressable action', () => {
	render( <ClientCheckoutV2 /> );
	expect( jest.mocked( CheckoutMain ).mock.calls.at( -1 )?.[ 0 ] ).toEqual(
		expect.objectContaining( {
			redirectTo:
				'http://agencies.localhost:3000/client/subscriptions?client_purchase_completed=true',
			customizedPreviousPath: '/client/subscriptions',
		} )
	);
	expect( screen.queryByText( 'Back to Pressable' ) ).not.toBeInTheDocument();
} );
