/**
 * @jest-environment jsdom
 */
import { readTeamsQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import nock from 'nock';
import { notFound } from 'calypso/controller';
import { saved } from '../controller';

jest.mock( '@automattic/calypso-config', () => {
	const isEnabled = ( feature ) => feature === 'reader/saved-posts';
	return { __esModule: true, default: Object.assign( jest.fn(), { isEnabled } ), isEnabled };
} );
jest.mock( 'calypso/controller', () => ( { notFound: jest.fn() } ) );
jest.mock( 'calypso/reader/controller-helper', () => ( {
	trackPageLoad: jest.fn(),
	trackScrollPage: jest.fn(),
	trackUpdatesLoaded: jest.fn(),
} ) );

const A8C = [ { slug: 'a8c', title: 'Automattic' } ];

function makeClient( teams ) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	if ( teams ) {
		queryClient.setQueryData( readTeamsQuery().queryKey, { number: teams.length, teams } );
	}
	return queryClient;
}

// Resolves with whether the controller rendered the Saved page or the 404.
function runSaved( queryClient ) {
	const context = { path: '/read/saved', queryClient };
	return new Promise( ( resolve ) => {
		jest.mocked( notFound ).mockImplementation( () => resolve( { context, rendered: '404' } ) );
		saved( context, () => resolve( { context, rendered: 'saved' } ) );
	} );
}

afterEach( () => nock.cleanAll() );

describe( 'saved', () => {
	it( 'renders the Saved page for Automatticians', async () => {
		const { context, rendered } = await runSaved( makeClient( A8C ) );

		expect( rendered ).toBe( 'saved' );
		expect( context.primary ).toBeTruthy();
	} );

	it( 'renders the Reader 404 for everyone else', async () => {
		const { rendered } = await runSaved( makeClient( [ { slug: 'okapi', title: 'Okapi' } ] ) );

		expect( rendered ).toBe( '404' );
	} );

	it( 'waits for the teams when they are not cached', async () => {
		const request = nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/teams' )
			.reply( 200, { number: 1, teams: A8C } );

		const { rendered } = await runSaved( makeClient() );

		expect( request.isDone() ).toBe( true );
		expect( rendered ).toBe( 'saved' );
	} );

	it( 'renders the Reader 404 when the teams fail to load', async () => {
		nock( 'https://public-api.wordpress.com' ).get( '/rest/v1.2/read/teams' ).reply( 500, {} );

		const { rendered } = await runSaved( makeClient() );

		expect( rendered ).toBe( '404' );
	} );
} );
