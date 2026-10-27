import nock from 'nock';
import { fetchReadNewBlogs } from '..';

const BASE = 'https://public-api.wordpress.com';

describe( 'fetchReadNewBlogs', () => {
	afterEach( () => nock.cleanAll() );

	it( 'fetches /wpcom/v2/reader/new-blogs and maps recs to camelCase, keeping order', async () => {
		const scope = nock( BASE )
			.get( '/wpcom/v2/reader/new-blogs' )
			.reply( 200, {
				updated: '2026-08-31T00:00:00Z',
				recs: [
					{ blog_id: 256526497, post_id: 526397, score: 0.018734 },
					{ blog_id: 70135762, post_id: 159152, score: 0.017022 },
				],
			} );

		await expect( fetchReadNewBlogs() ).resolves.toEqual( {
			updated: '2026-08-31T00:00:00Z',
			recs: [
				{ blogId: 256526497, postId: 526397, score: 0.018734 },
				{ blogId: 70135762, postId: 159152, score: 0.017022 },
			],
		} );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'coerces numeric strings to numbers', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/new-blogs' )
			.reply( 200, {
				updated: '2026-08-31T00:00:00Z',
				recs: [ { blog_id: '256526497', post_id: '526397', score: '0.5' } ],
			} );

		const { recs } = await fetchReadNewBlogs();
		expect( recs ).toEqual( [ { blogId: 256526497, postId: 526397, score: 0.5 } ] );
	} );

	it( 'returns an empty cold-start result when the user has no row', async () => {
		nock( BASE ).get( '/wpcom/v2/reader/new-blogs' ).reply( 200, { updated: null, recs: [] } );

		await expect( fetchReadNewBlogs() ).resolves.toEqual( { updated: null, recs: [] } );
	} );

	it( 'treats a missing or malformed recs field as empty', async () => {
		nock( BASE ).get( '/wpcom/v2/reader/new-blogs' ).reply( 200, { recs: 'nope' } );

		await expect( fetchReadNewBlogs() ).resolves.toEqual( { updated: null, recs: [] } );
	} );
} );
