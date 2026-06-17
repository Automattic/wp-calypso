import nock from 'nock';
import {
	addReadSpaceSource,
	createReadSpace,
	deleteReadSpace,
	deleteReadSpaceSource,
	updateReadSpace,
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
	layout_color: 'celadon',
	layout_icon: 'star',
	follows: [],
	tags: [ 'business' ],
	...overrides,
} );

describe( 'read spaces mutators', () => {
	afterEach( () => nock.cleanAll() );

	describe( 'createReadSpace', () => {
		it( 'posts only { title } when no optional fields are given', async () => {
			let body: unknown;
			nock( BASE )
				.post( '/wpcom/v2/reader/spaces/new', ( sent ) => {
					body = sent;
					return true;
				} )
				.reply( 201, detailResponse() );

			await createReadSpace( { name: 'Work' } );

			// The form's `name` is sent as the wire field `title`.
			expect( body ).toEqual( { title: 'Work' } );
		} );

		it( 'sends optional feeds, tags, and layout when provided', async () => {
			let body: unknown;
			nock( BASE )
				.post( '/wpcom/v2/reader/spaces/new', ( sent ) => {
					body = sent;
					return true;
				} )
				.reply( 201, detailResponse() );

			await createReadSpace( {
				name: 'Design',
				feeds: [ 'https://en.blog/feed/', 9982 ],
				tags: [ 'design' ],
				layoutColor: 'purple',
				layoutIcon: 'pages',
			} );

			expect( body ).toEqual( {
				title: 'Design',
				feeds: [ 'https://en.blog/feed/', 9982 ],
				tags: [ 'design' ],
				layout_color: 'purple',
				layout_icon: 'pages',
			} );
		} );

		it( 'adapts the 201 detail response to the client shape', async () => {
			nock( BASE )
				.post( '/wpcom/v2/reader/spaces/new' )
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

			const space = await createReadSpace( { name: 'Work', tags: [ 'business' ] } );

			expect( space ).toEqual( {
				id: '42',
				name: 'Work',
				layout: { color: 'celadon', icon: 'star' },
				tags: [ 'business' ],
				sources: [
					{ feedId: 9981, feedUrl: 'https://en.blog/feed/', blogId: 1, name: 'B', siteIcon: null },
				],
			} );
		} );

		it( 'rejects when the endpoint returns an error', async () => {
			nock( BASE )
				.post( '/wpcom/v2/reader/spaces/new' )
				.reply( 409, {
					code: 'reader_spaces_duplicate_slug',
					message: 'You already have a space with this title.',
					data: { status: 409 },
				} );

			await expect( createReadSpace( { name: 'Work' } ) ).rejects.toMatchObject( {
				code: 'reader_spaces_duplicate_slug',
			} );
		} );
	} );

	describe( 'updateReadSpace', () => {
		it( 'posts only the changed fields (mapping name -> title, layout) and adapts the result', async () => {
			let body: unknown;
			nock( BASE )
				.post( '/wpcom/v2/reader/spaces/3/update', ( sent ) => {
					body = sent;
					return true;
				} )
				.reply( 200, detailResponse( { id: 3, title: 'Renamed', tags: [ 'a', 'b' ] } ) );

			const space = await updateReadSpace( '3', {
				name: 'Renamed',
				tags: [ 'a', 'b' ],
				layoutColor: 'green',
			} );

			expect( body ).toEqual( { title: 'Renamed', tags: [ 'a', 'b' ], layout_color: 'green' } );
			expect( space ).toMatchObject( { id: '3', name: 'Renamed', tags: [ 'a', 'b' ] } );
		} );

		it( 'can clear tags by sending an empty array', async () => {
			let body: unknown;
			nock( BASE )
				.post( '/wpcom/v2/reader/spaces/3/update', ( sent ) => {
					body = sent;
					return true;
				} )
				.reply( 200, detailResponse( { id: 3, tags: [] } ) );

			await updateReadSpace( '3', { tags: [] } );

			expect( body ).toEqual( { tags: [] } );
		} );
	} );

	describe( 'deleteReadSpace', () => {
		it( 'posts to the delete endpoint and resolves the result', async () => {
			const scope = nock( BASE )
				.post( '/wpcom/v2/reader/spaces/42/delete' )
				.reply( 200, { deleted: true, id: 42 } );

			await expect( deleteReadSpace( '42' ) ).resolves.toEqual( { deleted: true, id: 42 } );
			expect( scope.isDone() ).toBe( true );
		} );

		it( 'rejects on a not-found error', async () => {
			nock( BASE )
				.post( '/wpcom/v2/reader/spaces/999/delete' )
				.reply( 404, { code: 'reader_spaces_not_found', message: '…', data: { status: 404 } } );

			await expect( deleteReadSpace( '999' ) ).rejects.toMatchObject( {
				code: 'reader_spaces_not_found',
			} );
		} );
	} );

	describe( 'addReadSpaceSource', () => {
		it( 'posts the feed id to feeds/new and adapts the returned detail', async () => {
			let body: unknown;
			nock( BASE )
				.post( '/wpcom/v2/reader/spaces/3/feeds/new', ( sent ) => {
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

			const space = await addReadSpaceSource( {
				spaceId: '3',
				subscription: makeSubscription(),
			} );

			expect( body ).toEqual( { feed: 456 } );
			expect( space.sources ).toEqual( [
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
				.post( '/wpcom/v2/reader/spaces/3/feeds/new', ( sent ) => {
					body = sent;
					return true;
				} )
				.reply( 200, detailResponse( { id: 3 } ) );

			await addReadSpaceSource( {
				spaceId: '3',
				subscription: makeSubscription( { feed_ID: null } ),
			} );

			expect( body ).toEqual( { feed: 'https://stratechery.com/feed' } );
		} );
	} );

	describe( 'deleteReadSpaceSource', () => {
		it( 'posts to feeds/<feed_id>/delete and adapts the returned detail', async () => {
			const scope = nock( BASE )
				.post( '/wpcom/v2/reader/spaces/3/feeds/456/delete' )
				.reply( 200, detailResponse( { id: 3, follows: [] } ) );

			const space = await deleteReadSpaceSource( {
				spaceId: '3',
				subscription: makeSubscription(),
			} );

			expect( scope.isDone() ).toBe( true );
			expect( space.sources ).toEqual( [] );
		} );
	} );
} );
