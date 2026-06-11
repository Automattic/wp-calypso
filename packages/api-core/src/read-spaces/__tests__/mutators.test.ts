import nock from 'nock';
import {
	addReadSpaceSource,
	createReadSpace,
	deleteReadSpace,
	deleteReadSpaceSource,
} from '../mutators';
import type { SiteSubscriptionItem } from '../../read-follows';

const BASE = 'https://public-api.wordpress.com';
const SPACE_ID = '2f5d8f28-04b7-4f6a-a908-6c4d2b4b8f21';

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

describe( 'read spaces mutators', () => {
	afterEach( () => nock.cleanAll() );

	describe( 'createReadSpace', () => {
		it( 'posts { title, tags } to the wpcom/v2 create endpoint', async () => {
			let requestBody: unknown;
			const scope = nock( BASE )
				.post( '/wpcom/v2/reader/spaces/new', ( body ) => {
					requestBody = body;
					return true;
				} )
				.reply( 201, {
					id: 42,
					title: 'Work',
					sites: [],
					tags: [ 'business', 'design' ],
					layout_color: 'celadon',
					layout_icon: 'star',
				} );

			await createReadSpace( { name: 'Work', tags: [ 'business', 'design' ] } );

			expect( scope.isDone() ).toBe( true );
			// The form's `name` is sent as the wire field `title`.
			expect( requestBody ).toEqual( { title: 'Work', tags: [ 'business', 'design' ] } );
		} );

		it( 'adapts the 201 response to the client ReadSpaceDetails shape', async () => {
			nock( BASE )
				.post( '/wpcom/v2/reader/spaces/new' )
				.reply( 201, {
					id: 42,
					title: 'Work',
					sites: [],
					tags: [ 'business' ],
					layout_color: 'celadon',
					layout_icon: 'star',
				} );

			const space = await createReadSpace( { name: 'Work', tags: [ 'business' ] } );

			expect( space ).toEqual( {
				id: '42',
				name: 'Work',
				tags: [ 'business' ],
				layout: { color: 'celadon', icon: 'star' },
				sources: [],
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

			await expect( createReadSpace( { name: 'Work', tags: [] } ) ).rejects.toMatchObject( {
				code: 'reader_spaces_duplicate_slug',
			} );
		} );
	} );

	describe( 'deleteReadSpace', () => {
		it( 'posts to the wpcom/v2 delete endpoint and resolves the result', async () => {
			const scope = nock( BASE )
				.post( '/wpcom/v2/reader/spaces/42/delete' )
				.reply( 200, { deleted: true, id: 42 } );

			await expect( deleteReadSpace( '42' ) ).resolves.toEqual( { deleted: true, id: 42 } );
			expect( scope.isDone() ).toBe( true );
		} );

		it( 'encodes the space id into the path', async () => {
			const scope = nock( BASE )
				.post( '/wpcom/v2/reader/spaces/a%2Fb/delete' )
				.reply( 200, { deleted: true, id: 7 } );

			await deleteReadSpace( 'a/b' );

			expect( scope.isDone() ).toBe( true );
		} );

		it( 'rejects on a not-found error', async () => {
			nock( BASE )
				.post( '/wpcom/v2/reader/spaces/999/delete' )
				.reply( 404, {
					code: 'reader_spaces_not_found',
					message: 'Space not found.',
					data: { status: 404 },
				} );

			await expect( deleteReadSpace( '999' ) ).rejects.toMatchObject( {
				code: 'reader_spaces_not_found',
			} );
		} );
	} );

	// The source mutators are still placeholders (no-op, no network) until their
	// endpoints land. Update to nock once wired.
	describe( 'source mutators (placeholder)', () => {
		it( 'resolves when adding a source', async () => {
			await expect(
				addReadSpaceSource( { spaceId: SPACE_ID, subscription: makeSubscription() } )
			).resolves.toBeUndefined();
		} );

		it( 'resolves when deleting a source', async () => {
			await expect(
				deleteReadSpaceSource( { spaceId: SPACE_ID, subscription: makeSubscription() } )
			).resolves.toBeUndefined();
		} );
	} );
} );
