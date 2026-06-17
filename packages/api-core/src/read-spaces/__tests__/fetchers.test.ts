import nock from 'nock';
import { fetchReadSpace, fetchReadSpaces } from '../fetchers';
import type { ReadSpaceApiItem } from '../adapters';

const BASE = 'https://public-api.wordpress.com';

const wireSummary = ( overrides: Partial< ReadSpaceApiItem > = {} ): ReadSpaceApiItem => ( {
	id: 3,
	title: 'Work',
	layout: { color: 'blue', icon: 'inbox' },
	...overrides,
} );

describe( 'read spaces fetchers', () => {
	afterEach( () => nock.cleanAll() );

	describe( 'fetchReadSpaces', () => {
		it( 'fetches the list from the wpcom/v2 endpoint', async () => {
			const scope = nock( BASE ).get( '/wpcom/v2/reader/spaces' ).reply( 200, [ wireSummary() ] );

			await fetchReadSpaces();

			expect( scope.isDone() ).toBe( true );
		} );

		it( 'adapts each summary to the client ReadSpace shape (no sources/tags)', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/spaces' )
				.reply( 200, [
					wireSummary( { id: 4, title: 'Gaming', layout: { color: 'purple', icon: 'box' } } ),
				] );

			const spaces = await fetchReadSpaces();

			expect( spaces ).toEqual( [
				{ id: '4', name: 'Gaming', layout: { color: 'purple', icon: 'box' } },
			] );
		} );

		it( 'returns an empty list when the response is not an array', async () => {
			nock( BASE ).get( '/wpcom/v2/reader/spaces' ).reply( 200, {} );

			await expect( fetchReadSpaces() ).resolves.toEqual( [] );
		} );
	} );

	describe( 'fetchReadSpace', () => {
		it( 'fetches the detail from the wpcom/v2 single-space endpoint and adapts it', async () => {
			const scope = nock( BASE )
				.get( '/wpcom/v2/reader/spaces/3' )
				.reply( 200, {
					id: 3,
					title: 'Work',
					layout: { color: 'blue', icon: 'inbox' },
					tags: [ 'photography' ],
					follows: [
						{
							feed_id: 9981,
							feed_url: 'https://en.blog/feed/',
							blog_id: 3584907,
							name: 'The WordPress.com Blog',
							icon: null,
						},
					],
				} );

			const space = await fetchReadSpace( '3' );

			expect( scope.isDone() ).toBe( true );
			expect( space ).toEqual( {
				id: '3',
				name: 'Work',
				layout: { color: 'blue', icon: 'inbox' },
				tags: [ 'photography' ],
				sources: [
					{
						feedId: 9981,
						feedUrl: 'https://en.blog/feed/',
						blogId: 3584907,
						name: 'The WordPress.com Blog',
						siteIcon: null,
					},
				],
			} );
		} );

		it( 'encodes the space id into the path', async () => {
			const scope = nock( BASE )
				.get( '/wpcom/v2/reader/spaces/a%2Fb' )
				.reply( 200, { id: 7, title: 'X', layout: { color: 'red', icon: 'box' } } );

			await fetchReadSpace( 'a/b' );

			expect( scope.isDone() ).toBe( true );
		} );

		it( 'rejects when the space is not found', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/spaces/999' )
				.reply( 404, {
					code: 'reader_spaces_not_found',
					message: 'Space not found.',
					data: { status: 404 },
				} );

			await expect( fetchReadSpace( '999' ) ).rejects.toMatchObject( {
				code: 'reader_spaces_not_found',
			} );
		} );
	} );
} );
