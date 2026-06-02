import nock from 'nock';
import { fetchReadFollows } from '../fetchers';

const BASE = 'https://public-api.wordpress.com';

describe( 'read follows fetchers', () => {
	afterEach( () => nock.cleanAll() );

	it( 'fetches follows with the legacy endpoint and adapts the response', async () => {
		const scope = nock( BASE )
			.get( '/rest/v1.2/read/following/mine' )
			.query( { page: '2', number: '10', meta: 'site' } )
			.reply( 200, {
				subscriptions: [
					{
						ID: '123',
						URL: 'https://example.com/feed/',
						blog_ID: '456',
						last_updated: '2024-01-02T03:04:05+00:00',
					},
				],
				total_subscriptions: 20,
				page: 2,
				number: 10,
			} );

		const page = await fetchReadFollows( { page: 2, number: 10, meta: 'site' } );

		expect( scope.isDone() ).toBe( true );
		expect( page ).toMatchObject( {
			totalCount: 20,
			page: 2,
			number: 10,
			subscriptions: [
				{
					ID: 123,
					URL: 'https://example.com/feed/',
					feed_URL: 'https://example.com/feed/',
					blog_ID: 456,
					is_following: true,
				},
			],
		} );
	} );
} );
