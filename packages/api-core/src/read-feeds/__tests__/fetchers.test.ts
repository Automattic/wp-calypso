import nock from 'nock';
import { fetchReadFeed, fetchReadFeedSearch, ReadFeedSearchSort } from '..';

const BASE = 'https://public-api.wordpress.com';

describe( 'read feed fetchers', () => {
	afterEach( () => nock.cleanAll() );

	it( 'fetches a single feed with the legacy endpoint', async () => {
		const scope = nock( BASE )
			.get( '/rest/v1.1/read/feed/123' )
			.reply( 200, { feed_ID: '123', name: 'Test feed' } );

		const feed = await fetchReadFeed( 123 );

		expect( scope.isDone() ).toBe( true );
		expect( feed.feed_ID ).toBe( '123' );
	} );

	it( 'searches feeds with the legacy query args', async () => {
		const scope = nock( BASE )
			.get( '/rest/v1.1/read/feed' )
			.query( {
				q: 'wordpress',
				exclude_followed: 'true',
				sort: ReadFeedSearchSort.Relevance,
				offset: '20',
			} )
			.reply( 200, { feeds: [], total: 0 } );

		const response = await fetchReadFeedSearch( {
			query: 'wordpress',
			excludeFollowed: true,
			sort: ReadFeedSearchSort.Relevance,
			offset: 20,
		} );

		expect( scope.isDone() ).toBe( true );
		expect( response.feeds ).toEqual( [] );
	} );
} );
