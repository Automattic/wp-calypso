import nock from 'nock';
import { createReadSpace, deleteReadSpace, updateReadSpace } from '../mutators';

const BASE = 'https://public-api.wordpress.com';

// A detail wire response (returned by create/update).
const detailResponse = ( overrides: Record< string, unknown > = {} ) => ( {
	id: 42,
	title: 'Work',
	layout: { color: 'celadon', icon: 'star' },
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
				.post( '/wpcom/v2/reader/spaces', ( sent ) => {
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
				.post( '/wpcom/v2/reader/spaces', ( sent ) => {
					body = sent;
					return true;
				} )
				.reply( 201, detailResponse() );

			await createReadSpace( {
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
				.post( '/wpcom/v2/reader/spaces' )
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
				languages: [],
				sources: [
					{ feedId: 9981, feedUrl: 'https://en.blog/feed/', blogId: 1, name: 'B', siteIcon: null },
				],
			} );
		} );

		it( 'rejects when the endpoint returns an error', async () => {
			nock( BASE )
				.post( '/wpcom/v2/reader/spaces' )
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
		it( 'PUTs only the changed fields (mapping name -> title) and adapts the result', async () => {
			let body: unknown;
			nock( BASE )
				.put( '/wpcom/v2/reader/spaces/3', ( sent ) => {
					body = sent;
					return true;
				} )
				.reply( 200, detailResponse( { id: 3, title: 'Renamed', tags: [ 'a', 'b' ] } ) );

			const space = await updateReadSpace( '3', {
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
			expect( space ).toMatchObject( { id: '3', name: 'Renamed', tags: [ 'a', 'b' ] } );
		} );

		it( 'can clear tags and feeds by sending empty arrays', async () => {
			let body: unknown;
			nock( BASE )
				.put( '/wpcom/v2/reader/spaces/3', ( sent ) => {
					body = sent;
					return true;
				} )
				.reply( 200, detailResponse( { id: 3, tags: [] } ) );

			await updateReadSpace( '3', { tags: [], feeds: [] } );

			expect( body ).toEqual( { tags: [], feeds: [] } );
		} );
	} );

	describe( 'deleteReadSpace', () => {
		it( 'DELETEs the space and resolves the result', async () => {
			const scope = nock( BASE )
				.delete( '/wpcom/v2/reader/spaces/42' )
				.reply( 200, { deleted: true, id: 42 } );

			await expect( deleteReadSpace( '42' ) ).resolves.toEqual( { deleted: true, id: 42 } );
			expect( scope.isDone() ).toBe( true );
		} );

		it( 'rejects on a not-found error', async () => {
			nock( BASE )
				.delete( '/wpcom/v2/reader/spaces/999' )
				.reply( 404, { code: 'reader_spaces_not_found', message: '…', data: { status: 404 } } );

			await expect( deleteReadSpace( '999' ) ).rejects.toMatchObject( {
				code: 'reader_spaces_not_found',
			} );
		} );
	} );
} );
