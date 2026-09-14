import nock from 'nock';
import {
	addReadShelfSource,
	createReadShelf,
	deleteReadShelf,
	deleteReadShelfSource,
	updateReadShelf,
} from '../mutators';
import type { SiteSubscriptionItem } from '../../read-follows';

const BASE = 'https://public-api.wordpress.com';

const makeSubscription = (
	overrides: Partial< SiteSubscriptionItem > = {}
): SiteSubscriptionItem => ( {
	ID: 1,
	URL: 'https://stratechery.com',
	feed_URL: 'https://stratechery.com/feed',
	blog_ID: 123,
	feed_ID: 456,
	name: 'Stratechery',
	site_icon: 'https://stratechery.com/icon.png',
	is_following: true,
	...overrides,
} );

// A detail wire response (returned by create/update/add-feed/remove-feed).
const detailResponse = ( overrides: Record< string, unknown > = {} ) => ( {
	id: 42,
	title: 'Work',
	layout: { color: 'celadon', icon: 'star' },
	follows: [],
	tags: [ 'business' ],
	...overrides,
} );

describe( 'read shelves mutators', () => {
	afterEach( () => nock.cleanAll() );

	describe( 'createReadShelf', () => {
		it( 'posts only { title } when no optional fields are given', async () => {
			let body: unknown;
			nock( BASE )
				.post( '/wpcom/v2/reader/shelves', ( sent ) => {
					body = sent;
					return true;
				} )
				.reply( 201, detailResponse() );

			await createReadShelf( { name: 'Work' } );

			// The form's `name` is sent as the wire field `title`.
			expect( body ).toEqual( { title: 'Work' } );
		} );

		it( 'sends optional feeds, tags, and layout when provided', async () => {
			let body: unknown;
			nock( BASE )
				.post( '/wpcom/v2/reader/shelves', ( sent ) => {
					body = sent;
					return true;
				} )
				.reply( 201, detailResponse() );

			await createReadShelf( {
				name: 'Design',
				feeds: [ 'https://en.blog/feed/', 9982 ],
				tags: [ 'design' ],
				languages: [ 'en', 'pt' ],
				layout: { color: 'purple', icon: 'pages', view: 'legacy' },
			} );

			expect( body ).toEqual( {
				title: 'Design',
				feeds: [ 'https://en.blog/feed/', 9982 ],
				tags: [ 'design' ],
				languages: [ 'en', 'pt' ],
				layout: { color: 'purple', icon: 'pages', view: 'legacy' },
			} );
		} );

		it( 'adapts the 201 detail response to the client shape', async () => {
			nock( BASE )
				.post( '/wpcom/v2/reader/shelves' )
				.reply(
					201,
					detailResponse( {
						follows: [
							{
								feed_id: 9981,
								feed_url: 'https://en.blog/feed/',
								blog_id: 1,
								name: 'B',
								icon: null,
							},
						],
					} )
				);

			const shelf = await createReadShelf( { name: 'Work', tags: [ 'business' ] } );

			expect( shelf ).toEqual( {
				id: '42',
				name: 'Work',
				layout: { color: 'celadon', icon: 'star' },
				tags: [ 'business' ],
				languages: [],
				sources: [
					{ feedId: 9981, feedUrl: 'https://en.blog/feed/', blogId: 1, name: 'B', siteIcon: null },
				],
			} );
		} );

		it( 'rejects when the endpoint returns an error', async () => {
			nock( BASE )
				.post( '/wpcom/v2/reader/shelves' )
				.reply( 409, {
					code: 'reader_shelves_duplicate_slug',
					message: 'You already have a shelf with this title.',
					data: { status: 409 },
				} );

			await expect( createReadShelf( { name: 'Work' } ) ).rejects.toMatchObject( {
				code: 'reader_shelves_duplicate_slug',
			} );
		} );
	} );

	describe( 'updateReadShelf', () => {
		it( 'PUTs only the changed fields (mapping name -> title) and adapts the result', async () => {
			let body: unknown;
			nock( BASE )
				.put( '/wpcom/v2/reader/shelves/3', ( sent ) => {
					body = sent;
					return true;
				} )
				.reply( 200, detailResponse( { id: 3, title: 'Renamed', tags: [ 'a', 'b' ] } ) );

			const shelf = await updateReadShelf( '3', {
				name: 'Renamed',
				tags: [ 'a', 'b' ],
				languages: [ 'en' ],
				feeds: [ 456, 'https://example.com/feed' ],
				layout: { color: 'green', view: 'gallery' },
			} );

			// layout is a partial merge — only the changed field is sent.
			expect( body ).toEqual( {
				title: 'Renamed',
				tags: [ 'a', 'b' ],
				languages: [ 'en' ],
				feeds: [ 456, 'https://example.com/feed' ],
				layout: { color: 'green', view: 'gallery' },
			} );
			expect( shelf ).toMatchObject( { id: '3', name: 'Renamed', tags: [ 'a', 'b' ] } );
		} );

		it( 'can clear tags and feeds by sending empty arrays', async () => {
			let body: unknown;
			nock( BASE )
				.put( '/wpcom/v2/reader/shelves/3', ( sent ) => {
					body = sent;
					return true;
				} )
				.reply( 200, detailResponse( { id: 3, tags: [] } ) );

			await updateReadShelf( '3', { tags: [], feeds: [] } );

			expect( body ).toEqual( { tags: [], feeds: [] } );
		} );
	} );

	describe( 'deleteReadShelf', () => {
		it( 'DELETEs the shelf and resolves the result', async () => {
			const scope = nock( BASE )
				.delete( '/wpcom/v2/reader/shelves/42' )
				.reply( 200, { deleted: true, id: 42 } );

			await expect( deleteReadShelf( '42' ) ).resolves.toEqual( { deleted: true, id: 42 } );
			expect( scope.isDone() ).toBe( true );
		} );

		it( 'rejects on a not-found error', async () => {
			nock( BASE )
				.delete( '/wpcom/v2/reader/shelves/999' )
				.reply( 404, { code: 'reader_shelves_not_found', message: '…', data: { status: 404 } } );

			await expect( deleteReadShelf( '999' ) ).rejects.toMatchObject( {
				code: 'reader_shelves_not_found',
			} );
		} );
	} );

	describe( 'addReadShelfSource', () => {
		it( 'posts the feed id to feeds and adapts the returned detail', async () => {
			let body: unknown;
			nock( BASE )
				.post( '/wpcom/v2/reader/shelves/3/feeds', ( sent ) => {
					body = sent;
					return true;
				} )
				.reply(
					200,
					detailResponse( {
						id: 3,
						follows: [
							{
								feed_id: 456,
								feed_url: 'https://stratechery.com/feed',
								blog_id: 123,
								name: 'Stratechery',
								icon: null,
							},
						],
					} )
				);

			const shelf = await addReadShelfSource( {
				shelfId: '3',
				subscription: makeSubscription(),
			} );

			expect( body ).toEqual( { feed: 456 } );
			expect( shelf.sources ).toEqual( [
				{
					feedId: 456,
					feedUrl: 'https://stratechery.com/feed',
					blogId: 123,
					name: 'Stratechery',
					siteIcon: null,
				},
			] );
		} );

		it( 'falls back to the feed URL when the subscription has no feed id', async () => {
			let body: unknown;
			nock( BASE )
				.post( '/wpcom/v2/reader/shelves/3/feeds', ( sent ) => {
					body = sent;
					return true;
				} )
				.reply( 200, detailResponse( { id: 3 } ) );

			await addReadShelfSource( {
				shelfId: '3',
				subscription: makeSubscription( { feed_ID: null } ),
			} );

			expect( body ).toEqual( { feed: 'https://stratechery.com/feed' } );
		} );
	} );

	describe( 'deleteReadShelfSource', () => {
		it( 'DELETEs feeds/<feed_id> and adapts the returned detail', async () => {
			const scope = nock( BASE )
				.delete( '/wpcom/v2/reader/shelves/3/feeds/456' )
				.reply( 200, detailResponse( { id: 3, follows: [] } ) );

			const shelf = await deleteReadShelfSource( {
				shelfId: '3',
				subscription: makeSubscription(),
			} );

			expect( scope.isDone() ).toBe( true );
			expect( shelf.sources ).toEqual( [] );
		} );

		it( 'rejects without a request when the subscription has no numeric feed id', async () => {
			// No nock interceptor: the guard must throw before any request is made.
			await expect(
				deleteReadShelfSource( {
					shelfId: '3',
					subscription: makeSubscription( { feed_ID: null } ),
				} )
			).rejects.toThrow( 'numeric feed id' );
		} );
	} );
} );
