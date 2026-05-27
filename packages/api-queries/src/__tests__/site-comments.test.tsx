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

	it( 'keeps the infinite comments key tied to the fixed newest-first order', () => {
		const params = {
			siteId: 123,
			postId: 456,
			status: 'approved',
			order: 'ASC',
		};
		const query = siteCommentsInfiniteQuery( params );

		expect( query.queryKey ).toEqual( [
			'site',
			'comments',
			'infinite',
			123,
			456,
			'approved',
			{ number: 50, order: 'DESC' },
		] );
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
