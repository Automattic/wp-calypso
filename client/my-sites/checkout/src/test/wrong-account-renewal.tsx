/**
 * @jest-environment jsdom
 */
import { CheckoutProvider } from '@automattic/composite-checkout';
import { getEmptyResponseCart } from '@automattic/shopping-cart';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { redirectToLogout } from 'calypso/state/current-user/actions';
import { renderWithProvider, renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import {
	LogInToCorrectAccountButton,
	WrongAccountRenewal,
} from '../components/wrong-account-renewal';
import {
	useHasWrongAccountRenewalError,
	WRONG_ACCOUNT_RENEWAL_ERROR_CODE,
} from '../hooks/use-has-wrong-account-renewal-error';
import type { ResponseCart } from '@automattic/shopping-cart';

jest.mock( 'calypso/state/current-user/actions', () => ( {
	...jest.requireActual( 'calypso/state/current-user/actions' ),
	redirectToLogout: jest.fn( () => ( { type: 'REDIRECT_TO_LOGOUT_MOCK' } ) ),
} ) );

function getCartWithErrorCodes( codes: string[] ): ResponseCart {
	return {
		...getEmptyResponseCart(),
		messages: {
			errors: codes.map( ( code ) => ( { code, message: 'Something went wrong' } ) ),
		},
	};
}

/**
 * Both components are rendered inside checkout, so they rely on its theme and
 * form state the same way every other step of the page does.
 */
function CheckoutWrapper( { children }: { children: React.ReactNode } ) {
	return (
		<CheckoutProvider paymentMethods={ [] } paymentProcessors={ {} }>
			{ children }
		</CheckoutProvider>
	);
}

const stateWithUser = {
	currentUser: {
		id: 12345,
		user: { ID: 12345, username: 'wrongaccount' },
	},
};

describe( 'useHasWrongAccountRenewalError', () => {
	it( 'is false for a cart with no errors', () => {
		const { result } = renderHookWithProvider( () =>
			useHasWrongAccountRenewalError( getEmptyResponseCart() )
		);
		expect( result.current ).toBe( false );
	} );

	it( 'is false for a cart with some other error', () => {
		const { result } = renderHookWithProvider( () =>
			useHasWrongAccountRenewalError( getCartWithErrorCodes( [ 'invalid-product-id' ] ) )
		);
		expect( result.current ).toBe( false );
	} );

	it( 'is true for a cart with the wrong account renewal error', () => {
		const { result } = renderHookWithProvider( () =>
			useHasWrongAccountRenewalError(
				getCartWithErrorCodes( [ WRONG_ACCOUNT_RENEWAL_ERROR_CODE ] )
			)
		);
		expect( result.current ).toBe( true );
	} );

	it( 'stays true once the error has been seen, because cart errors are transient', () => {
		const { result, rerender } = renderHookWithProvider(
			( cart: ResponseCart ) => useHasWrongAccountRenewalError( cart ),
			{ initialProps: getCartWithErrorCodes( [ WRONG_ACCOUNT_RENEWAL_ERROR_CODE ] ) }
		);
		expect( result.current ).toBe( true );

		// A later fetch of the cart (the cart refetches when the window regains
		// focus) returns no messages at all.
		rerender( getEmptyResponseCart() );
		expect( result.current ).toBe( true );
	} );
} );

describe( 'WrongAccountRenewal', () => {
	it( 'explains the problem and names the account the customer is logged in to', () => {
		renderWithProvider(
			<CheckoutWrapper>
				<WrongAccountRenewal />
			</CheckoutWrapper>,
			{ initialState: stateWithUser }
		);
		expect(
			screen.getByText( 'This subscription belongs to a different account' )
		).toBeInTheDocument();
		expect( screen.getByText( /wrongaccount/ ) ).toBeInTheDocument();
	} );
} );

describe( 'LogInToCorrectAccountButton', () => {
	it( 'logs the customer out and sends them to log in again, returning here afterwards', async () => {
		const user = userEvent.setup();
		renderWithProvider(
			<CheckoutWrapper>
				<LogInToCorrectAccountButton />
			</CheckoutWrapper>,
			{ initialState: stateWithUser }
		);

		await user.click( screen.getByRole( 'button', { name: 'Log in to the right account' } ) );

		expect( redirectToLogout ).toHaveBeenCalledWith(
			`/log-in?redirect_to=${ encodeURIComponent( window.location.href ) }`
		);
	} );
} );
