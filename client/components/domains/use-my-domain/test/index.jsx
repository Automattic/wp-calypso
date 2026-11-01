/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { getAvailabilityErrorMessage } from 'calypso/components/domains/use-my-domain/utilities/get-availability-error-message';
import wpcom from 'calypso/lib/wp';
import UseMyDomain from '../index';

jest.mock( 'calypso/lib/wp', () => {
	const isAvailable = jest.fn();
	return {
		__esModule: true,
		default: {
			domain: jest.fn( () => ( { isAvailable } ) ),
			req: { get: jest.fn( () => Promise.resolve( {} ) ) },
			isAvailable,
		},
	};
} );

jest.mock( 'calypso/lib/domains/get-wpcom-registration-status', () => ( {
	getWpcomRegistrationStatus: jest.fn( () => Promise.resolve( null ) ),
} ) );

jest.mock(
	'calypso/components/domains/use-my-domain/utilities/get-availability-error-message',
	() => ( {
		getAvailabilityErrorMessage: jest.fn(),
	} )
);

jest.mock( '@automattic/data-stores', () => ( {
	...jest.requireActual( '@automattic/data-stores' ),
	useSiteDomainsQuery: () => ( { isFetchingSiteDomains: false } ),
} ) );

jest.mock( 'calypso/dashboard/app/routing', () => ( {
	getDashboardFromQuery: () => undefined,
} ) );

jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSite: () => null,
} ) );

jest.mock( 'calypso/state/sites/domains/selectors', () => ( {
	isUpdatingPrimaryDomain: () => false,
} ) );

jest.mock( '../transfer-or-connect', () => ( { domain } ) => (
	<div data-testid="transfer-or-connect">{ domain }</div>
) );

const renderUseMyDomain = ( props = {} ) =>
	render(
		<Provider store={ createStore( () => ( {} ) ) }>
			<UseMyDomain { ...props } />
		</Provider>
	);

const deferred = () => {
	let resolve;
	let reject;
	const promise = new Promise( ( res, rej ) => {
		resolve = res;
		reject = rej;
	} );
	return { promise, resolve, reject };
};

describe( 'UseMyDomain', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		getAvailabilityErrorMessage.mockReturnValue( null );
	} );

	test( 'shows the domain input when there is no initial query', () => {
		renderUseMyDomain();

		expect( screen.getByRole( 'textbox', { name: 'Domain name' } ) ).toHaveValue( '' );
		expect( screen.getByRole( 'button', { name: 'Continue' } ) ).toBeVisible();
		expect( wpcom.isAvailable ).not.toHaveBeenCalled();
	} );

	test( 'keeps showing the prefilled domain input when the initial query is invalid', () => {
		renderUseMyDomain( { initialQuery: 'not a domain' } );

		expect( screen.getByRole( 'textbox', { name: 'Domain name' } ) ).toHaveValue( 'not a domain' );
		expect( wpcom.isAvailable ).not.toHaveBeenCalled();
	} );

	test( 'shows a loading state instead of the input while a valid initial query is validated, then transfer or connect', async () => {
		const availability = deferred();
		wpcom.isAvailable.mockReturnValue( availability.promise );
		const onValidatingInitialQueryChange = jest.fn();

		renderUseMyDomain( { initialQuery: 'example.com', onValidatingInitialQueryChange } );

		expect( screen.queryByRole( 'textbox', { name: 'Domain name' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Continue' } ) ).not.toBeInTheDocument();
		expect( onValidatingInitialQueryChange ).toHaveBeenLastCalledWith( true );

		availability.resolve( { status: 'mapped_to_other_site_same_user', mappable: 'mappable' } );

		expect( await screen.findByTestId( 'transfer-or-connect' ) ).toHaveTextContent( 'example.com' );
		expect( screen.queryByRole( 'textbox', { name: 'Domain name' } ) ).not.toBeInTheDocument();
		await waitFor( () =>
			expect( onValidatingInitialQueryChange ).toHaveBeenLastCalledWith( false )
		);
	} );

	test( 'falls back to the domain input with the error when validating the initial query fails', async () => {
		wpcom.isAvailable.mockResolvedValue( { status: 'available', mappable: 'available' } );
		getAvailabilityErrorMessage.mockReturnValue( "This domain isn't registered. Try again." );

		renderUseMyDomain( { initialQuery: 'example.com' } );

		expect( screen.queryByRole( 'textbox', { name: 'Domain name' } ) ).not.toBeInTheDocument();

		expect(
			await screen.findByText( "This domain isn't registered. Try again." )
		).toBeInTheDocument();
		expect( screen.getByRole( 'textbox', { name: 'Domain name' } ) ).toHaveValue( 'example.com' );
		expect( screen.queryByTestId( 'transfer-or-connect' ) ).not.toBeInTheDocument();
	} );

	test( 'falls back to the domain input with the error when the availability request throws', async () => {
		wpcom.isAvailable.mockRejectedValue( new Error( 'Something went wrong' ) );

		renderUseMyDomain( { initialQuery: 'example.com' } );

		expect( await screen.findByText( 'Something went wrong' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'textbox', { name: 'Domain name' } ) ).toHaveValue( 'example.com' );
	} );
} );
