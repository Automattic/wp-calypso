import { QueryClient } from '@tanstack/react-query';
import nock from 'nock';
import { randomSiteNameQuery } from '../site-suggestions';

const BASE = 'https://public-api.wordpress.com';

function mockSiteSuggestions( suggestions: { title: string }[] ) {
	nock( BASE ).get( '/wpcom/v2/site-suggestions' ).reply( 200, { suggestions } );
}

function mockFreeDomainSuggestions( suggestions: { domain_name: string }[] ) {
	nock( BASE ).get( '/rest/v1.1/domains/suggestions' ).query( true ).reply( 200, suggestions );
}

function fetchRandomSiteName() {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	return queryClient.fetchQuery( randomSiteNameQuery() );
}

describe( 'randomSiteNameQuery', () => {
	afterEach( () => nock.cleanAll() );

	it( 'turns a suggested title into the free subdomain label', async () => {
		mockSiteSuggestions( [ { title: 'Rambling Thoughts' } ] );
		mockFreeDomainSuggestions( [ { domain_name: 'ramblingthoughts.wordpress.com' } ] );

		await expect( fetchRandomSiteName() ).resolves.toBe( 'ramblingthoughts' );
	} );

	it( 'fails when the server has no title to suggest', async () => {
		mockSiteSuggestions( [] );

		await expect( fetchRandomSiteName() ).rejects.toThrow( 'No site title suggestion' );
	} );
} );
