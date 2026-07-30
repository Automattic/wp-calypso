import nock from 'nock';
import {
	canonicalizeReadShelfSlug,
	fetchReadShelf,
	fetchReadShelfBySlug,
	fetchReadShelves,
} from '../fetchers';
import type { ReadShelfApiItem } from '../adapters';

const BASE = 'https://public-api.wordpress.com';

const wireSummary = ( overrides: Partial< ReadShelfApiItem > = {} ): ReadShelfApiItem => ( {
	id: 3,
	slug: 'work',
	title: 'Work',
	layout: { color: 'blue', icon: 'inbox' },
	...overrides,
} );

describe( 'read shelves fetchers', () => {
	afterEach( () => nock.cleanAll() );

	describe( 'fetchReadShelves', () => {
		it( 'fetches the list from the wpcom/v2 endpoint', async () => {
			const scope = nock( BASE ).get( '/wpcom/v2/reader/shelves' ).reply( 200, [ wireSummary() ] );

			await fetchReadShelves();

			expect( scope.isDone() ).toBe( true );
		} );

		it( 'adapts each summary to the client ReadShelf shape (no sources/tags)', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/shelves' )
				.reply( 200, [
					wireSummary( {
						id: 4,
						slug: 'gaming',
						title: 'Gaming',
						layout: { color: 'purple', icon: 'box' },
					} ),
				] );

			const shelves = await fetchReadShelves();

			expect( shelves ).toEqual( [
				{ id: '4', slug: 'gaming', name: 'Gaming', layout: { color: 'purple', icon: 'box' } },
			] );
		} );

		it( 'returns an empty list when the response is not an array', async () => {
			nock( BASE ).get( '/wpcom/v2/reader/shelves' ).reply( 200, {} );

			await expect( fetchReadShelves() ).resolves.toEqual( [] );
		} );
	} );

	describe( 'fetchReadShelf', () => {
		it( 'fetches the detail from the wpcom/v2 single-shelf endpoint and adapts it', async () => {
			const scope = nock( BASE )
				.get( '/wpcom/v2/reader/shelves/3' )
				.reply( 200, {
					id: 3,
					slug: 'work',
					title: 'Work',
					layout: { color: 'blue', icon: 'inbox' },
					tags: [ 'photography' ],
					languages: [ 'en' ],
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

			const shelf = await fetchReadShelf( '3' );

			expect( scope.isDone() ).toBe( true );
			expect( shelf ).toEqual( {
				id: '3',
				slug: 'work',
				name: 'Work',
				layout: { color: 'blue', icon: 'inbox' },
				tags: [ 'photography' ],
				languages: [ 'en' ],
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

		it( 'encodes the shelf id into the path', async () => {
			const scope = nock( BASE )
				.get( '/wpcom/v2/reader/shelves/a%2Fb' )
				.reply( 200, { id: 7, title: 'X', layout: { color: 'red', icon: 'box' } } );

			await fetchReadShelf( 'a/b' );

			expect( scope.isDone() ).toBe( true );
		} );

		it( 'rejects when the shelf is not found', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/shelves/999' )
				.reply( 404, {
					code: 'reader_shelves_not_found',
					message: 'Shelf not found.',
					data: { status: 404 },
				} );

			await expect( fetchReadShelf( '999' ) ).rejects.toMatchObject( {
				code: 'reader_shelves_not_found',
			} );
		} );
	} );

	describe( 'fetchReadShelfBySlug', () => {
		it( 'fetches the detail from the by-slug endpoint and adapts it', async () => {
			const scope = nock( BASE )
				.get( '/wpcom/v2/reader/shelves/slug/work' )
				.reply( 200, {
					id: 3,
					slug: 'work',
					title: 'Work',
					layout: { color: 'blue', icon: 'inbox' },
					tags: [ 'photography' ],
					languages: [ 'en' ],
					follows: [],
				} );

			const shelf = await fetchReadShelfBySlug( 'work' );

			expect( scope.isDone() ).toBe( true );
			expect( shelf ).toMatchObject( { id: '3', slug: 'work', name: 'Work' } );
		} );

		it( 'encodes the slug into the path', async () => {
			const scope = nock( BASE )
				.get( '/wpcom/v2/reader/shelves/slug/a%2Fb' )
				.reply( 200, { id: 7, slug: 'a/b', title: 'X', layout: { color: 'red', icon: 'box' } } );

			await fetchReadShelfBySlug( 'a/b' );

			expect( scope.isDone() ).toBe( true );
		} );

		it( 'single-encodes an already percent-encoded (non-Latin) slug', async () => {
			// The API/sidebar pass the encoded slug; canonicalizing before encoding
			// avoids double-encoding it (`%d0%bf` must not become `%25d0%25bf`).
			const scope = nock( BASE )
				.get( '/wpcom/v2/reader/shelves/slug/%D0%BF%D1%80%D0%B8%D0%B2%D0%B5%D1%82' )
				.reply( 200, {
					id: 8,
					slug: 'привет',
					title: 'Привет',
					layout: { color: 'blue', icon: 'inbox' },
				} );

			await fetchReadShelfBySlug( '%d0%bf%d1%80%d0%b8%d0%b2%d0%b5%d1%82' );

			expect( scope.isDone() ).toBe( true );
		} );

		it( 'rejects when no shelf has that slug', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/shelves/slug/gone' )
				.reply( 404, {
					code: 'reader_shelves_not_found',
					message: 'Shelf not found.',
					data: { status: 404 },
				} );

			await expect( fetchReadShelfBySlug( 'gone' ) ).rejects.toMatchObject( {
				code: 'reader_shelves_not_found',
			} );
		} );
	} );

	describe( 'canonicalizeReadShelfSlug', () => {
		it( 'leaves an ASCII slug unchanged', () => {
			expect( canonicalizeReadShelfSlug( 'my-shelf' ) ).toBe( 'my-shelf' );
		} );

		it( 'decodes a percent-encoded slug to its canonical form', () => {
			expect( canonicalizeReadShelfSlug( '%d0%bf%d1%80%d0%b8%d0%b2%d0%b5%d1%82' ) ).toBe(
				'привет'
			);
		} );

		it( 'is idempotent on an already-decoded slug', () => {
			expect( canonicalizeReadShelfSlug( 'привет' ) ).toBe( 'привет' );
		} );

		it( 'returns a malformed slug unchanged instead of throwing', () => {
			expect( canonicalizeReadShelfSlug( '%zz' ) ).toBe( '%zz' );
		} );
	} );
} );
