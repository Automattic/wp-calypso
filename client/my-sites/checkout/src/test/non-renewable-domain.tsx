/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { CheckoutProvider } from '@automattic/composite-checkout';
import { getEmptyResponseCart } from '@automattic/shopping-cart';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider, renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { NonRenewableDomain, SearchForNewDomainButton } from '../components/non-renewable-domain';
import {
	useHasNonRenewableDomainError,
	NON_RENEWABLE_DOMAIN_ERROR_CODE,
} from '../hooks/use-has-non-renewable-domain-error';
import type { ResponseCart } from '@automattic/shopping-cart';

jest.mock( '@automattic/calypso-router', () => jest.fn() );

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

const withSelectedSite = {
	initialState: {
		sites: { items: { 12345: { ID: 12345, URL: 'https://example.wordpress.com' } } },
		ui: { selectedSiteId: 12345 },
	},
	reducers: { ui: uiReducer },
};

describe( 'useHasNonRenewableDomainError', () => {
	it( 'is false for a cart with no errors', () => {
		const { result } = renderHookWithProvider( () =>
			useHasNonRenewableDomainError( getEmptyResponseCart() )
		);
		expect( result.current ).toBe( false );
	} );

	it( 'is false for a cart with some other error', () => {
		const { result } = renderHookWithProvider( () =>
			useHasNonRenewableDomainError( getCartWithErrorCodes( [ 'renewal-domain-pending' ] ) )
		);
		expect( result.current ).toBe( false );
	} );

	it( 'is true for a cart with the non-renewable domain error', () => {
		const { result } = renderHookWithProvider( () =>
			useHasNonRenewableDomainError( getCartWithErrorCodes( [ NON_RENEWABLE_DOMAIN_ERROR_CODE ] ) )
		);
		expect( result.current ).toBe( true );
	} );

	it( 'stays true once the error has been seen, because cart errors are transient', () => {
		const { result, rerender } = renderHookWithProvider(
			( cart: ResponseCart ) => useHasNonRenewableDomainError( cart ),
			{ initialProps: getCartWithErrorCodes( [ NON_RENEWABLE_DOMAIN_ERROR_CODE ] ) }
		);
		expect( result.current ).toBe( true );

		// A later fetch of the cart (the cart refetches when the window regains
		// focus) returns no messages at all.
		rerender( getEmptyResponseCart() );
		expect( result.current ).toBe( true );
	} );
} );

describe( 'NonRenewableDomain', () => {
	it( 'explains that the domain is past both its renewal and redemption periods', () => {
		renderWithProvider(
			<CheckoutWrapper>
				<NonRenewableDomain />
			</CheckoutWrapper>
		);
		expect( screen.getByText( 'This domain can no longer be renewed' ) ).toBeInTheDocument();
		expect( screen.getByText( /redemption period/ ) ).toBeInTheDocument();
	} );
} );

describe( 'SearchForNewDomainButton', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'sends the customer to domain search for the selected site', async () => {
		const user = userEvent.setup();
		renderWithProvider(
			<CheckoutWrapper>
				<SearchForNewDomainButton />
			</CheckoutWrapper>,
			withSelectedSite
		);

		await user.click( screen.getByRole( 'button', { name: 'Search for a new domain' } ) );

		expect( page ).toHaveBeenCalledWith( '/domains/add/example.wordpress.com' );
	} );

	it( 'sends the customer to domain search with no site when checkout has none', async () => {
		const user = userEvent.setup();
		renderWithProvider(
			<CheckoutWrapper>
				<SearchForNewDomainButton />
			</CheckoutWrapper>
		);

		await user.click( screen.getByRole( 'button', { name: 'Search for a new domain' } ) );

		expect( page ).toHaveBeenCalledWith( '/domains/add' );
	} );
} );
