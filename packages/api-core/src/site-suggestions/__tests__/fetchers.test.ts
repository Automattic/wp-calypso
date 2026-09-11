import nock from 'nock';
import { fetchSiteSuggestions } from '..';

const BASE = 'https://public-api.wordpress.com';

describe( 'fetchSiteSuggestions', () => {
	afterEach( () => nock.cleanAll() );

	it( 'returns the suggestions from the envelope', async () => {
		const scope = nock( BASE )
			.get( '/wpcom/v2/site-suggestions' )
			.reply( 200, { suggestions: [ { title: 'Rambling Thoughts' } ] } );

		await expect( fetchSiteSuggestions() ).resolves.toEqual( [ { title: 'Rambling Thoughts' } ] );
		expect( scope.isDone() ).toBe( true );
	} );
} );
