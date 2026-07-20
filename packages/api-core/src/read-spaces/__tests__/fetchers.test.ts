import nock from 'nock';
import {
	canonicalizeReadSpaceSlug,
	fetchReadSpace,
	fetchReadSpaceBySlug,
	fetchReadSpaces,
} from '../fetchers';
import type { ReadSpaceApiItem } from '../adapters';

const BASE = 'https://public-api.wordpress.com';

const wireSummary = ( overrides: Partial< ReadSpaceApiItem > = {} ): ReadSpaceApiItem => ( {
	id: 3,
	slug: 'work',
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
					wireSummary( {
						id: 4,
						slug: 'gaming',
						title: 'Gaming',
						layout: { color: 'purple', icon: 'box' },
					} ),
				] );

			const spaces = await fetchReadSpaces();

			expect( spaces ).toEqual( [
				{ id: '4', slug: 'gaming', name: 'Gaming', layout: { color: 'purple', icon: 'box' } },
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

			const space = await fetchReadSpace( '3' );

			expect( scope.isDone() ).toBe( true );
			expect( space ).toEqual( {
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

	describe( 'fetchReadSpaceBySlug', () => {
		it( 'fetches the detail from the by-slug endpoint and adapts it', async () => {
			const scope = nock( BASE )
				.get( '/wpcom/v2/reader/spaces/slug/work' )
				.reply( 200, {
					id: 3,
					slug: 'work',
					title: 'Work',
					layout: { color: 'blue', icon: 'inbox' },
					tags: [ 'photography' ],
					languages: [ 'en' ],
					follows: [],
				} );

			const space = await fetchReadSpaceBySlug( 'work' );

			expect( scope.isDone() ).toBe( true );
			expect( space ).toMatchObject( { id: '3', slug: 'work', name: 'Work' } );
		} );

		it( 'encodes the slug into the path', async () => {
			const scope = nock( BASE )
				.get( '/wpcom/v2/reader/spaces/slug/a%2Fb' )
				.reply( 200, { id: 7, slug: 'a/b', title: 'X', layout: { color: 'red', icon: 'box' } } );

			await fetchReadSpaceBySlug( 'a/b' );

			expect( scope.isDone() ).toBe( true );
		} );

		it( 'single-encodes an already percent-encoded (non-Latin) slug', async () => {
			// The API/sidebar pass the encoded slug; canonicalizing before encoding
			// avoids double-encoding it (`%d0%bf` must not become `%25d0%25bf`).
			const scope = nock( BASE )
				.get( '/wpcom/v2/reader/spaces/slug/%D0%BF%D1%80%D0%B8%D0%B2%D0%B5%D1%82' )
				.reply( 200, {
					id: 8,
					slug: 'привет',
					title: 'Привет',
					layout: { color: 'blue', icon: 'inbox' },
				} );

			await fetchReadSpaceBySlug( '%d0%bf%d1%80%d0%b8%d0%b2%d0%b5%d1%82' );

			expect( scope.isDone() ).toBe( true );
		} );

		it( 'rejects when no space has that slug', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/spaces/slug/gone' )
				.reply( 404, {
					code: 'reader_spaces_not_found',
					message: 'Space not found.',
					data: { status: 404 },
				} );

			await expect( fetchReadSpaceBySlug( 'gone' ) ).rejects.toMatchObject( {
				code: 'reader_spaces_not_found',
			} );
		} );
	} );

	describe( 'canonicalizeReadSpaceSlug', () => {
		it( 'leaves an ASCII slug unchanged', () => {
			expect( canonicalizeReadSpaceSlug( 'my-space' ) ).toBe( 'my-space' );
		} );

		it( 'decodes a percent-encoded slug to its canonical form', () => {
			expect( canonicalizeReadSpaceSlug( '%d0%bf%d1%80%d0%b8%d0%b2%d0%b5%d1%82' ) ).toBe(
				'привет'
			);
		} );

		it( 'is idempotent on an already-decoded slug', () => {
			expect( canonicalizeReadSpaceSlug( 'привет' ) ).toBe( 'привет' );
		} );

		it( 'returns a malformed slug unchanged instead of throwing', () => {
			expect( canonicalizeReadSpaceSlug( '%zz' ) ).toBe( '%zz' );
		} );
	} );
} );
