/**
 * @jest-environment jsdom
 */
import { readTeamsQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import nock from 'nock';
import { notFound } from 'calypso/controller';
import { requireSavedPosts } from '../controller';

jest.mock( '@automattic/calypso-config', () => {
	const isEnabled = ( feature ) => feature === 'reader/saved-posts';
	return { __esModule: true, default: Object.assign( jest.fn(), { isEnabled } ), isEnabled };
} );
jest.mock( 'calypso/controller', () => ( { notFound: jest.fn() } ) );

const A8C = [ { slug: 'a8c', title: 'Automattic' } ];

function makeClient( teams ) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	if ( teams ) {
		queryClient.setQueryData( readTeamsQuery().queryKey, { number: teams.length, teams } );
	}
	return queryClient;
}

async function runGate( queryClient ) {
	const context = { path: '/read/saved', queryClient };
	const next = jest.fn();
	await requireSavedPosts( context, next );
	return { context, next };
}

beforeEach( () => jest.mocked( notFound ).mockClear() );

afterEach( () => nock.cleanAll() );

describe( 'requireSavedPosts', () => {
	it( 'lets Automatticians through', async () => {
		const { next } = await runGate( makeClient( A8C ) );

		expect( next ).toHaveBeenCalled();
		expect( notFound ).not.toHaveBeenCalled();
	} );

	it( 'renders the Reader 404 for everyone else', async () => {
		const { context, next } = await runGate( makeClient( [ { slug: 'okapi', title: 'Okapi' } ] ) );

		expect( notFound ).toHaveBeenCalledWith( context, next );
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'waits for the teams when they are not cached', async () => {
		const request = nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/teams' )
			.reply( 200, { number: 1, teams: A8C } );

		const { next } = await runGate( makeClient() );

		expect( request.isDone() ).toBe( true );
		expect( next ).toHaveBeenCalled();
	} );

	it( 'renders the Reader 404 when the teams fail to load', async () => {
		nock( 'https://public-api.wordpress.com' ).get( '/rest/v1.2/read/teams' ).reply( 500, {} );

		const { context, next } = await runGate( makeClient() );

		expect( notFound ).toHaveBeenCalledWith( context, next );
		expect( next ).not.toHaveBeenCalled();
	} );
} );
