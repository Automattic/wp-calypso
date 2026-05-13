/*
 * @jest-environment jsdom
 */
import { ReaderOrganization } from '@automattic/api-core';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { withReaderOrganizations, WithReaderOrganizationsProps } from '../index';

const mockOrganizations: ReaderOrganization[] = [
	{ id: 1, title: 'Automattic', slug: 'automattic', sites_count: 5 },
	{ id: 2, title: 'P2', slug: 'p2', sites_count: 3 },
];

const TestComponent = ( { organizations }: WithReaderOrganizationsProps ) => {
	if ( organizations.length === 0 ) {
		return null;
	}

	return <>{ organizations.map( ( org ) => org.title ).join( ', ' ) }</>;
};

const WrappedComponent = withReaderOrganizations( TestComponent );

const getQueryClient = () => {
	const instance = new QueryClient();
	instance.setDefaultOptions( {
		queries: {
			retry: false,
		},
	} );
	return instance;
};

describe( 'withReaderOrganizations', () => {
	beforeAll( () => {
		nock.disableNetConnect();
	} );

	beforeEach( () => {
		nock.cleanAll();
	} );

	it( 'injects organizations as a prop on the wrapped component', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/organizations' )
			.reply( 200, { organizations: mockOrganizations } );

		renderWithProvider( <WrappedComponent />, { queryClient: getQueryClient() } );

		await waitFor( () => {
			expect( screen.getByText( 'Automattic, P2' ) ).toBeVisible();
		} );
	} );

	it( 'falls back to an empty array when the request fails', async () => {
		const scope = nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/organizations' )
			.reply( 500, { message: 'Internal Server Error' } );

		const { container } = renderWithProvider( <WrappedComponent />, {
			queryClient: getQueryClient(),
		} );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		expect( container ).toBeEmptyDOMElement();
	} );
} );
