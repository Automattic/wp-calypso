import nock from 'nock';
import { fetchSitePostReplies } from '../fetchers';

const BASE = 'https://public-api.wordpress.com';

describe( 'site post replies fetchers', () => {
	afterEach( () => nock.cleanAll() );

	it( 'fetches post replies with pagination query params', async () => {
		const scope = nock( BASE )
			.get( '/rest/v1.1/sites/123/posts/456/replies' )
			.query( {
				number: '50',
				status: 'approved',
				order: 'DESC',
				author_wpcom_data: 'true',
				force: 'wpcom',
				before: '2026-05-01T00:00:00.000Z',
			} )
			.reply( 200, { comments: [ { ID: 7, content: 'hello' } ], found: 1 } );

		const response = await fetchSitePostReplies( {
			siteId: 123,
			postId: 456,
			status: 'approved',
			order: 'DESC',
			before: '2026-05-01T00:00:00.000Z',
		} );

		expect( scope.isDone() ).toBe( true );
		expect( response.comments ).toEqual( [ { ID: 7, content: 'hello' } ] );
		expect( response.found ).toBe( 1 );
	} );
} );
