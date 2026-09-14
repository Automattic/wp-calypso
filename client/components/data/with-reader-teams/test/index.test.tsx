/*
 * @jest-environment jsdom
 */
import { ReaderTeam } from '@automattic/api-core';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { withReaderTeams, WithReaderTeamsProps } from '../index';

const mockTeams: ReaderTeam[] = [
	{ slug: 'a8c', title: 'Automattic' },
	{ slug: 'p2', title: 'P2' },
];

const TestComponent = ( { teams }: WithReaderTeamsProps ) => {
	if ( teams.length === 0 ) {
		return null;
	}

	return <>{ teams.map( ( team ) => team.title ).join( ', ' ) }</>;
};

const WrappedComponent = withReaderTeams( TestComponent );

const getQueryClient = () => {
	const instance = new QueryClient();
	instance.setDefaultOptions( {
		queries: {
			retry: false,
		},
	} );
	return instance;
};

describe( 'withReaderTeams', () => {
	beforeAll( () => {
		nock.disableNetConnect();
	} );

	beforeEach( () => {
		nock.cleanAll();
	} );

	it( 'injects teams as a prop on the wrapped component', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/teams' )
			.reply( 200, { number: mockTeams.length, teams: mockTeams } );

		renderWithProvider( <WrappedComponent />, { queryClient: getQueryClient() } );

		await waitFor( () => {
			expect( screen.getByText( 'Automattic, P2' ) ).toBeVisible();
		} );
	} );

	it( 'falls back to an empty array when the request fails', async () => {
		const scope = nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/teams' )
			.reply( 500, { message: 'Internal Server Error' } );

		const { container } = renderWithProvider( <WrappedComponent />, {
			queryClient: getQueryClient(),
		} );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		expect( container ).toBeEmptyDOMElement();
	} );
} );
