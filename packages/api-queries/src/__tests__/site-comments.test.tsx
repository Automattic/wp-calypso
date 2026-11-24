import nock from 'nock';
import {
	createSiteCommentReplyMutation,
	createSitePostCommentMutation,
	likeSiteCommentMutation,
	siteCommentsInfiniteQuery,
} from '../site-comments';

const BASE = 'https://public-api.wordpress.com';

describe( 'site comments queries', () => {
	it( 'uses a separate memory-only key for infinite comments', () => {
		const query = siteCommentsInfiniteQuery( { siteId: 123, postId: 456, status: 'approved' } );

		expect( query.queryKey ).toEqual( [
			'site',
			'comments',
			'infinite',
			123,
			456,
			'approved',
			{ number: 50, order: 'DESC' },
		] );
		expect( query.meta ).toEqual( { persist: false } );
	} );

	it( 'uses before cursor from the oldest comment for earlier pages', () => {
		const query = siteCommentsInfiniteQuery( {
			siteId: 123,
			postId: 456,
			status: 'approved',
			number: 2,
		} );
		const page = {
			comments: [
				{ ID: 1, content: 'newer', date: '2026-05-02T00:00:00.000Z' },
				{ ID: 2, content: 'older', date: '2026-05-01T00:00:00.000Z' },
			],
			found: 3,
		};

		expect( query.getNextPageParam?.( page, [ page ], undefined, [ undefined ] ) ).toEqual( {
			direction: 'before',
			before: '2026-05-01T00:00:00.000Z',
		} );
	} );

	it( 'uses after cursor and offset from the newest loaded comments for later pages', () => {
		const query = siteCommentsInfiniteQuery( {
			siteId: 123,
			postId: 456,
			status: 'approved',
			number: 2,
		} );
		const firstPage = {
			comments: [
				{ ID: 1, content: 'newest tie', date: '2026-05-02T00:00:00.000Z' },
				{ ID: 2, content: 'older', date: '2026-05-01T00:00:00.000Z' },
			],
			found: 3,
		};
		const secondPage = {
			comments: [ { ID: 3, content: 'newest tie 2', date: '2026-05-02T00:00:00.000Z' } ],
			found: 3,
		};

		expect(
			query.getPreviousPageParam?.( firstPage, [ firstPage, secondPage ], undefined, [
				undefined,
				{ direction: 'before' },
			] )
		).toEqual( {
			direction: 'after',
			after: '2026-05-02T00:00:00.000Z',
			offset: 2,
		} );
	} );

	it( 'keeps paging earlier while a cursor page has more comments before it', () => {
		const query = siteCommentsInfiniteQuery( {
			siteId: 123,
			postId: 456,
			status: 'approved',
			number: 2,
		} );
		const firstPage = {
			comments: [
				{ ID: 5, content: 'five', date: '2026-05-05T00:00:00.000Z' },
				{ ID: 4, content: 'four', date: '2026-05-04T00:00:00.000Z' },
			],
			found: 5,
		};
		const cursorPage = {
			comments: [
				{ ID: 3, content: 'three', date: '2026-05-03T00:00:00.000Z' },
				{ ID: 2, content: 'two', date: '2026-05-02T00:00:00.000Z' },
			],
			found: 3,
		};

		expect(
			query.getNextPageParam?.( cursorPage, [ firstPage, cursorPage ], undefined, [
				undefined,
				{ direction: 'before', before: '2026-05-04T00:00:00.000Z' },
			] )
		).toEqual( { direction: 'before', before: '2026-05-02T00:00:00.000Z' } );
	} );

	it( 'stops earlier pagination when the loaded unique comments reach the found count', () => {
		const query = siteCommentsInfiniteQuery( {
			siteId: 123,
			postId: 456,
			status: 'approved',
			number: 2,
		} );
		const page = {
			comments: [
				{ ID: 1, content: 'one', date: '2026-05-02T00:00:00.000Z' },
				{ ID: 2, content: 'two', date: '2026-05-01T00:00:00.000Z' },
			],
			found: 2,
		};

		expect( query.getNextPageParam?.( page, [ page ], undefined, [ undefined ] ) ).toBeUndefined();
	} );
} );

describe( 'oldest-first site comments query', () => {
	it( 'pages forward after the newest comment fetched until the server has no more', () => {
		const query = siteCommentsInfiniteQuery( {
			siteId: 123,
			postId: 456,
			status: 'approved',
			number: 2,
			order: 'ASC',
		} );
		const comment = ( ID: number, day: number ) => ( {
			ID,
			content: `${ ID }`,
			date: `2026-05-0${ day }T00:00:00.000Z`,
		} );
		// A comment posted from this view is cached at the front of the page.
		const firstPage = { comments: [ comment( 9, 9 ), comment( 1, 1 ), comment( 2, 2 ) ], found: 5 };
		const lastPage = { comments: [ comment( 3, 3 ), comment( 4, 4 ) ], found: 3 };
		const afterSecond = {
			direction: 'after' as const,
			after: '2026-05-02T00:00:00.000Z',
			offset: 1,
		};

		expect(
			query.getNextPageParam?.( firstPage, [ firstPage ], undefined, [ undefined ] )
		).toEqual( afterSecond );
		expect(
			query.getNextPageParam?.( lastPage, [ firstPage, lastPage ], afterSecond, [
				undefined,
				afterSecond,
			] )
		).toBeUndefined();
	} );
} );

describe( 'site comment mutations', () => {
	afterEach( () => {
		nock.cleanAll();
	} );

	it( 'keeps create mutation options free of reader cache handlers', () => {
		const mutation = createSitePostCommentMutation();

		expect( mutation.mutationFn ).toEqual( expect.any( Function ) );
		expect( mutation.onMutate ).toBeUndefined();
		expect( mutation.onSuccess ).toBeUndefined();
		expect( mutation.onError ).toBeUndefined();
	} );

	it( 'creates comment replies without requiring a post id in the mutation variables', async () => {
		const request = nock( BASE )
			.post( '/rest/v1.1/sites/123/comments/9/replies/new', {
				content: 'Reply body',
			} )
			.reply( 200, {
				ID: 10,
				content: 'Reply body',
				parent: { ID: 9 },
				status: 'approved',
			} );
		const mutation = createSiteCommentReplyMutation();

		if ( ! mutation.mutationFn ) {
			throw new Error( 'Expected reply mutation to have a mutationFn' );
		}

		await expect(
			mutation.mutationFn( {
				siteId: 123,
				parentCommentId: 9,
				content: 'Reply body',
			} )
		).resolves.toEqual(
			expect.objectContaining( {
				ID: 10,
				content: 'Reply body',
			} )
		);
		expect( request.isDone() ).toBe( true );
	} );

	it( 'keeps like mutation options free of reader cache handlers', () => {
		const mutation = likeSiteCommentMutation();

		expect( mutation.mutationFn ).toEqual( expect.any( Function ) );
		expect( mutation.onMutate ).toBeUndefined();
		expect( mutation.onSuccess ).toBeUndefined();
		expect( mutation.onError ).toBeUndefined();
	} );
} );
