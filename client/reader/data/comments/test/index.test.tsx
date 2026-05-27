/*
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import {
	buildCommentsTreeForDisplay,
	isCommentsApiDisabledError,
	mergeCommentLists,
	useComment,
	useComments,
	useCommentsApiDisabled,
	usePostCommentActions,
	usePostCommentsApiDisabled,
} from '../index';
import type { ReactNode } from 'react';

const BASE = 'https://public-api.wordpress.com';

const buildQueryClient = () => {
	const instance = new QueryClient();
	instance.setDefaultOptions( { queries: { retry: false } } );
	return instance;
};

const buildDefaultQueryClient = () => new QueryClient();

const renderComments = ( params = {} ) => {
	const queryClient = buildQueryClient();
	const wrapper = ( { children }: { children: ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);

	return renderHook(
		() =>
			useComments( {
				siteId: 123,
				postId: 456,
				status: 'approved',
				commentTotal: 3,
				...params,
			} ),
		{ wrapper }
	);
};

const renderCommentsWithApiDisabled = ( params = {} ) => {
	const queryClient = buildQueryClient();
	const wrapper = ( { children }: { children: ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);

	return renderHook(
		() => ( {
			comments: useComments( {
				siteId: 123,
				postId: 456,
				status: 'approved',
				commentTotal: 3,
				...params,
			} ),
			isCommentsApiDisabled: useCommentsApiDisabled( 123 ),
		} ),
		{ wrapper }
	);
};

const renderCommentsWithDefaultQueryClient = ( params = {} ) => {
	const queryClient = buildDefaultQueryClient();
	const wrapper = ( { children }: { children: ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);

	return renderHook(
		() =>
			useComments( {
				siteId: 123,
				postId: 456,
				status: 'approved',
				commentTotal: 3,
				...params,
			} ),
		{ wrapper }
	);
};

const renderComment = ( params = {}, options = {} ) => {
	const queryClient = buildQueryClient();
	const wrapper = ( { children }: { children: ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);

	return renderHook(
		() =>
			useComment(
				{
					siteId: 123,
					commentId: 789,
					...params,
				},
				options
			),
		{ wrapper }
	);
};

const renderCommentWithDefaultQueryClient = ( params = {}, options = {} ) => {
	const queryClient = buildDefaultQueryClient();
	const wrapper = ( { children }: { children: ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);

	return renderHook(
		() =>
			useComment(
				{
					siteId: 123,
					commentId: 789,
					...params,
				},
				options
			),
		{ wrapper }
	);
};

const renderCommentsWithActions = ( params = {} ) => {
	const queryClient = buildQueryClient();
	const wrapper = ( { children }: { children: ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);

	return renderHook(
		() => ( {
			commentsQuery: useComments( {
				siteId: 123,
				postId: 456,
				status: 'approved',
				commentTotal: 1,
				...params,
			} ),
			actions: usePostCommentActions(),
		} ),
		{ wrapper }
	);
};

const renderCommentsApiDisabled = ( params = {}, options = {} ) => {
	const queryClient = buildQueryClient();
	const wrapper = ( { children }: { children: ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);

	return renderHook(
		() => ( {
			isPostCommentsApiDisabled: usePostCommentsApiDisabled(
				{
					siteId: 123,
					postId: 456,
					...params,
				},
				options
			),
			isCommentsApiDisabled: useCommentsApiDisabled( 123 ),
		} ),
		{ wrapper }
	);
};

describe( 'isCommentsApiDisabledError', () => {
	it( 'recognizes statusCode and disabled API message variants', () => {
		expect(
			isCommentsApiDisabledError( {
				statusCode: 403,
				name: 'UnauthorizedError',
				message: 'API calls to this blog have been disabled. Please contact support.',
			} )
		).toBe( true );
	} );
} );

describe( 'useComments', () => {
	beforeAll( () => {
		nock.disableNetConnect();
	} );

	beforeEach( () => {
		nock.cleanAll();
	} );

	it( 'fetches and exposes comments sorted chronologically', async () => {
		nock( BASE )
			.get( '/rest/v1.1/sites/123/posts/456/replies' )
			.query( {
				number: '50',
				status: 'approved',
				order: 'DESC',
				author_wpcom_data: 'true',
				force: 'wpcom',
			} )
			.reply( 200, {
				comments: [
					{ ID: 2, date: '2026-05-02T00:00:00.000Z', parent: false },
					{ ID: 1, date: '2026-05-01T00:00:00.000Z', parent: false },
				],
				found: 2,
			} );

		const { result } = renderComments();

		await waitFor( () => {
			expect( result.current.comments.map( ( comment ) => comment.ID ) ).toEqual( [ 1, 2 ] );
		} );
	} );

	it( 'deduplicates comments across pages', async () => {
		nock( BASE )
			.get( '/rest/v1.1/sites/123/posts/456/replies' )
			.query( {
				number: '2',
				status: 'approved',
				order: 'DESC',
				author_wpcom_data: 'true',
				force: 'wpcom',
			} )
			.reply( 200, {
				comments: [
					{ ID: 2, date: '2026-05-02T00:00:00.000Z', parent: false },
					{ ID: 1, date: '2026-05-01T00:00:00.000Z', parent: false },
				],
				found: 3,
			} );
		nock( BASE )
			.get( '/rest/v1.1/sites/123/posts/456/replies' )
			.query( {
				number: '2',
				status: 'approved',
				order: 'DESC',
				author_wpcom_data: 'true',
				force: 'wpcom',
				before: '2026-05-01T00:00:00.000Z',
			} )
			.reply( 200, {
				comments: [
					{ ID: 1, date: '2026-05-01T00:00:00.000Z', parent: false },
					{ ID: 3, date: '2026-04-30T00:00:00.000Z', parent: false },
				],
				found: 3,
			} );

		const { result } = renderComments( { number: 2 } );

		await waitFor( () => expect( result.current.comments ).toHaveLength( 2 ) );
		await act( async () => {
			await result.current.fetchEarlierComments();
		} );

		await waitFor( () => {
			expect( result.current.comments.map( ( comment ) => comment.ID ) ).toEqual( [ 3, 1, 2 ] );
		} );
	} );

	it( 'merges additional comments into a comments list', () => {
		const comments = mergeCommentLists(
			[
				{ ID: 2, content: '', date: '2026-05-02T00:00:00.000Z', parent: false },
				{ ID: 1, content: '', date: '2026-05-01T00:00:00.000Z', parent: false },
			],
			[ { ID: 3, content: '', date: '2026-05-03T00:00:00.000Z', parent: false } ]
		);

		expect( comments.map( ( comment ) => comment.ID ) ).toEqual( [ 1, 2, 3 ] );
	} );

	it( 'deduplicates additional comments against the base comments', () => {
		const comments = mergeCommentLists(
			[
				{
					ID: 1,
					content: 'From page',
					date: '2026-05-01T00:00:00.000Z',
					parent: false,
				},
			],
			[
				{
					ID: 1,
					content: 'From additional comments',
					date: '2026-05-01T00:00:00.000Z',
					parent: false,
				},
			]
		);

		expect( comments ).toEqual( [ expect.objectContaining( { ID: 1, content: 'From page' } ) ] );
	} );

	it( 'uses merged comments to complete the display tree', () => {
		const comments = mergeCommentLists(
			[
				{
					ID: 2,
					content: '',
					date: '2026-05-02T00:00:00.000Z',
					parent: { ID: 1 },
					status: 'approved',
				},
			],
			[
				{
					ID: 1,
					content: '',
					date: '2026-05-01T00:00:00.000Z',
					parent: false,
					status: 'approved',
				},
			]
		);
		const commentsTree = buildCommentsTreeForDisplay( { comments } );

		expect( commentsTree.children ).toEqual( [ 1 ] );
		expect( commentsTree[ 1 ].children ).toEqual( [ 2 ] );
	} );

	it( 'builds a parent-child tree and filters pending comments from other authors', async () => {
		nock( BASE )
			.get( '/rest/v1.1/sites/123/posts/456/replies' )
			.query( {
				number: '50',
				status: 'approved',
				order: 'DESC',
				author_wpcom_data: 'true',
				force: 'wpcom',
			} )
			.reply( 200, {
				comments: [
					{
						ID: 2,
						content: '',
						date: '2026-05-02T00:00:00.000Z',
						parent: { ID: 1 },
						status: 'approved',
					},
					{
						ID: 1,
						content: '',
						date: '2026-05-01T00:00:00.000Z',
						parent: false,
						status: 'approved',
					},
					{
						ID: 3,
						date: '2026-05-03T00:00:00.000Z',
						parent: false,
						status: 'unapproved',
						author: { ID: 999 },
					},
				],
				found: 3,
			} );

		const { result } = renderComments( {
			displayStatus: 'all',
			authorId: 123,
		} );

		await waitFor( () => {
			expect( result.current.commentsTree.children ).toEqual( [ 1 ] );
			expect( result.current.commentsTree[ 1 ].children ).toEqual( [ 2 ] );
			expect( result.current.commentsTree[ 3 ] ).toBeUndefined();
		} );
	} );

	it( 'reports fetch status using legacy comments status names', async () => {
		nock( BASE )
			.get( '/rest/v1.1/sites/123/posts/456/replies' )
			.query( {
				number: '2',
				status: 'approved',
				order: 'DESC',
				author_wpcom_data: 'true',
				force: 'wpcom',
			} )
			.reply( 200, {
				comments: [
					{ ID: 2, date: '2026-05-02T00:00:00.000Z', parent: false },
					{ ID: 1, date: '2026-05-01T00:00:00.000Z', parent: false },
				],
				found: 3,
			} );

		const { result } = renderComments( { number: 2 } );

		await waitFor( () => {
			expect( result.current.commentsFetchingStatus ).toEqual( {
				haveEarlierCommentsToFetch: true,
				haveLaterCommentsToFetch: true,
				hasReceivedBefore: true,
				hasReceivedAfter: false,
			} );
		} );
	} );

	it( 'does not report more comments to fetch when the found total is already loaded', async () => {
		nock( BASE )
			.get( '/rest/v1.1/sites/123/posts/456/replies' )
			.query( {
				number: '2',
				status: 'approved',
				order: 'DESC',
				author_wpcom_data: 'true',
				force: 'wpcom',
			} )
			.reply( 200, {
				comments: [
					{ ID: 2, date: '2026-05-02T00:00:00.000Z', parent: false },
					{ ID: 1, date: '2026-05-01T00:00:00.000Z', parent: false },
				],
				found: 2,
			} );

		const { result } = renderComments( { number: 2 } );

		await waitFor( () => {
			expect( result.current.commentsFetchingStatus ).toMatchObject( {
				haveEarlierCommentsToFetch: false,
				haveLaterCommentsToFetch: false,
			} );
		} );
	} );

	it( 'stops reporting more comments after pagination loads the found total', async () => {
		nock( BASE )
			.get( '/rest/v1.1/sites/123/posts/456/replies' )
			.query( {
				number: '2',
				status: 'approved',
				order: 'DESC',
				author_wpcom_data: 'true',
				force: 'wpcom',
			} )
			.reply( 200, {
				comments: [
					{ ID: 2, date: '2026-05-02T00:00:00.000Z', parent: false },
					{ ID: 1, date: '2026-05-01T00:00:00.000Z', parent: false },
				],
				found: 3,
			} );
		nock( BASE )
			.get( '/rest/v1.1/sites/123/posts/456/replies' )
			.query( {
				number: '2',
				status: 'approved',
				order: 'DESC',
				author_wpcom_data: 'true',
				force: 'wpcom',
				before: '2026-05-01T00:00:00.000Z',
			} )
			.reply( 200, {
				comments: [
					{ ID: 1, date: '2026-05-01T00:00:00.000Z', parent: false },
					{ ID: 3, date: '2026-04-30T00:00:00.000Z', parent: false },
				],
				found: 3,
			} );

		const { result } = renderComments( { number: 2 } );

		await waitFor( () => expect( result.current.comments ).toHaveLength( 2 ) );
		await act( async () => {
			await result.current.fetchEarlierComments();
		} );

		await waitFor( () => {
			expect( result.current.commentsFetchingStatus ).toMatchObject( {
				haveEarlierCommentsToFetch: false,
				haveLaterCommentsToFetch: false,
			} );
		} );
	} );

	it( 'keeps comments with invalid dates after dated comments', async () => {
		nock( BASE )
			.get( '/rest/v1.1/sites/123/posts/456/replies' )
			.query( {
				number: '50',
				status: 'approved',
				order: 'DESC',
				author_wpcom_data: 'true',
				force: 'wpcom',
			} )
			.reply( 200, {
				comments: [
					{ ID: 2, parent: false },
					{ ID: 1, date: '2026-05-01T00:00:00.000Z', parent: false },
				],
				found: 2,
			} );

		const { result } = renderComments();

		await waitFor( () => {
			expect( result.current.comments.map( ( comment ) => comment.ID ) ).toEqual( [ 1, 2 ] );
		} );
	} );

	it( 'marks the site comments API as disabled when the comments list returns the disabled API error', async () => {
		const request = nock( BASE )
			.get( '/rest/v1.1/sites/123/posts/456/replies' )
			.query( {
				number: '50',
				status: 'approved',
				order: 'DESC',
				author_wpcom_data: 'true',
				force: 'wpcom',
			} )
			.reply( 403, {
				name: 'UnauthorizedError',
				message: 'API calls to this blog have been disabled.',
			} );

		const { result } = renderCommentsWithApiDisabled();

		await waitFor( () => {
			expect( request.isDone() ).toBe( true );
			expect( result.current.isCommentsApiDisabled ).toBe( true );
		} );
	} );

	it( 'does not retry failed comment list requests by default', async () => {
		let requestCount = 0;
		nock( BASE )
			.get( '/rest/v1.1/sites/123/posts/456/replies' )
			.query( {
				number: '50',
				status: 'approved',
				order: 'DESC',
				author_wpcom_data: 'true',
				force: 'wpcom',
			} )
			.times( 2 )
			.reply( () => {
				requestCount++;
				return [ 500, { error: 'server_error' } ];
			} );

		renderCommentsWithDefaultQueryClient();

		await waitFor( () => expect( requestCount ).toBe( 1 ) );
		await new Promise( ( resolve ) => setTimeout( resolve, 1200 ) );

		expect( requestCount ).toBe( 1 );
	} );
} );

describe( 'usePostCommentsApiDisabled', () => {
	beforeAll( () => {
		nock.disableNetConnect();
	} );

	beforeEach( () => {
		nock.cleanAll();
	} );

	it( 'marks the site comments API as disabled when the comments request returns the disabled API error', async () => {
		nock( BASE )
			.get( '/rest/v1.1/sites/123/posts/456/replies' )
			.query( {
				number: '50',
				status: 'approved',
				order: 'DESC',
				author_wpcom_data: 'true',
				force: 'wpcom',
			} )
			.reply( 403, {
				name: 'UnauthorizedError',
				message: 'API calls to this blog have been disabled.',
			} );

		const { result } = renderCommentsApiDisabled();

		await waitFor( () => {
			expect( result.current.isPostCommentsApiDisabled ).toBe( true );
			expect( result.current.isCommentsApiDisabled ).toBe( true );
		} );
	} );

	it( 'does not probe comments when disabled through options', async () => {
		const request = nock( BASE )
			.get( '/rest/v1.1/sites/123/posts/456/replies' )
			.query( true )
			.reply( 200, { comments: [], found: 0 } );

		const { result } = renderCommentsApiDisabled( {}, { enabled: false } );

		expect( result.current.isPostCommentsApiDisabled ).toBe( false );
		expect( result.current.isCommentsApiDisabled ).toBe( false );
		expect( request.isDone() ).toBe( false );
	} );
} );

describe( 'useComment', () => {
	beforeAll( () => {
		nock.disableNetConnect();
	} );

	beforeEach( () => {
		nock.cleanAll();
	} );

	it( 'fetches a single comment by id', async () => {
		nock( BASE )
			.get( '/rest/v1.1/sites/123/comments/789' )
			.query( {
				author_wpcom_data: 'true',
				force: 'wpcom',
			} )
			.reply( 200, {
				ID: 789,
				content: 'Deep linked comment',
				date: '2026-05-03T00:00:00.000Z',
				parent: false,
				post: { ID: 456 },
			} );

		const { result } = renderComment();

		await waitFor( () => {
			expect( result.current.data ).toMatchObject( {
				ID: 789,
				content: 'Deep linked comment',
			} );
		} );
	} );

	it( 'does not fetch when disabled', () => {
		const request = nock( BASE )
			.get( '/rest/v1.1/sites/123/comments/789' )
			.query( {
				author_wpcom_data: 'true',
				force: 'wpcom',
			} )
			.reply( 200, {
				ID: 789,
				content: 'Deep linked comment',
				date: '2026-05-03T00:00:00.000Z',
				parent: false,
				post: { ID: 456 },
			} );

		const { result } = renderComment( {}, { enabled: false } );

		expect( result.current.fetchStatus ).toBe( 'idle' );
		expect( request.isDone() ).toBe( false );
	} );

	it( 'does not retry failed single comment requests by default', async () => {
		let requestCount = 0;
		nock( BASE )
			.get( '/rest/v1.1/sites/123/comments/789' )
			.query( {
				author_wpcom_data: 'true',
				force: 'wpcom',
			} )
			.times( 2 )
			.reply( () => {
				requestCount++;
				return [ 404, { error: 'unknown_comment' } ];
			} );

		renderCommentWithDefaultQueryClient();

		await waitFor( () => expect( requestCount ).toBe( 1 ) );
		await new Promise( ( resolve ) => setTimeout( resolve, 1200 ) );

		expect( requestCount ).toBe( 1 );
	} );
} );

describe( 'usePostCommentActions', () => {
	beforeAll( () => {
		nock.disableNetConnect();
	} );

	beforeEach( () => {
		nock.cleanAll();
		jest.useRealTimers();
	} );

	it( 'adds a placeholder while creating a root comment and replaces it on success', async () => {
		nock( BASE )
			.get( '/rest/v1.1/sites/123/posts/456/replies' )
			.query( {
				number: '50',
				status: 'approved',
				order: 'DESC',
				author_wpcom_data: 'true',
				force: 'wpcom',
			} )
			.reply( 200, {
				comments: [
					{
						ID: 1,
						content: 'Existing',
						date: '2026-05-01T00:00:00.000Z',
						parent: false,
						status: 'approved',
					},
				],
				found: 1,
			} );
		nock( BASE )
			.post( '/rest/v1.1/sites/123/posts/456/replies/new', { content: 'Hello world' } )
			.delay( 100 )
			.reply( 200, {
				ID: 2,
				content: 'Hello world',
				date: '2026-05-02T00:00:00.000Z',
				parent: false,
				post: { ID: 456 },
				status: 'approved',
			} );

		const { result } = renderCommentsWithActions();

		await waitFor( () => expect( result.current.commentsQuery.comments ).toHaveLength( 1 ) );

		act( () => {
			result.current.actions.writeComment( 'Hello world', 123, 456 );
		} );

		await waitFor( () => {
			expect( result.current.commentsQuery.comments ).toEqual(
				expect.arrayContaining( [
					expect.objectContaining( {
						content: 'Hello world',
						isPlaceholder: true,
						placeholderState: 'PENDING',
					} ),
				] )
			);
		} );

		await waitFor( () => {
			expect( result.current.commentsQuery.comments ).toEqual(
				expect.arrayContaining( [
					expect.objectContaining( {
						ID: 2,
						content: 'Hello world',
					} ),
				] )
			);
			expect( result.current.commentsQuery.comments ).not.toEqual(
				expect.arrayContaining( [ expect.objectContaining( { isPlaceholder: true } ) ] )
			);
		} );
	} );

	it( 'adds a placeholder while creating a reply and replaces it on success', async () => {
		nock( BASE )
			.get( '/rest/v1.1/sites/123/posts/456/replies' )
			.query( {
				number: '50',
				status: 'approved',
				order: 'DESC',
				author_wpcom_data: 'true',
				force: 'wpcom',
			} )
			.reply( 200, {
				comments: [
					{
						ID: 1,
						content: 'Parent',
						date: '2026-05-01T00:00:00.000Z',
						parent: false,
						status: 'approved',
					},
				],
				found: 1,
			} );
		nock( BASE )
			.post( '/rest/v1.1/sites/123/comments/1/replies/new', { content: 'Reply' } )
			.delay( 100 )
			.reply( 200, {
				ID: 3,
				content: 'Reply',
				date: '2026-05-02T00:00:00.000Z',
				parent: { ID: 1 },
				post: { ID: 456 },
				status: 'approved',
			} );

		const { result } = renderCommentsWithActions();

		await waitFor( () => expect( result.current.commentsQuery.comments ).toHaveLength( 1 ) );

		act( () => {
			result.current.actions.replyComment( 'Reply', 123, 456, 1 );
		} );

		await waitFor( () => {
			expect( result.current.commentsQuery.comments ).toEqual(
				expect.arrayContaining( [
					expect.objectContaining( {
						content: 'Reply',
						parent: { ID: 1 },
						isPlaceholder: true,
						placeholderState: 'PENDING',
					} ),
				] )
			);
		} );

		await waitFor( () => {
			expect( result.current.commentsQuery.comments ).toEqual(
				expect.arrayContaining( [
					expect.objectContaining( {
						ID: 3,
						content: 'Reply',
						parent: { ID: 1 },
					} ),
				] )
			);
			expect( result.current.commentsQuery.comments ).not.toEqual(
				expect.arrayContaining( [ expect.objectContaining( { isPlaceholder: true } ) ] )
			);
		} );
	} );

	it( 'keeps a failed placeholder in an error state when creating a root comment fails', async () => {
		nock( BASE )
			.get( '/rest/v1.1/sites/123/posts/456/replies' )
			.query( {
				number: '50',
				status: 'approved',
				order: 'DESC',
				author_wpcom_data: 'true',
				force: 'wpcom',
			} )
			.reply( 200, {
				comments: [],
				found: 0,
			} );
		nock( BASE )
			.post( '/rest/v1.1/sites/123/posts/456/replies/new', { content: 'Nope' } )
			.reply( 400, {
				error: 'comment_duplicate',
				message: 'Duplicate comment',
			} );

		const { result } = renderCommentsWithActions( { displayStatus: 'all' } );

		await waitFor( () => expect( result.current.commentsQuery.isSuccess ).toBe( true ) );

		await act( async () => {
			await expect( result.current.actions.writeComment( 'Nope', 123, 456 ) ).rejects.toBeDefined();
		} );

		await waitFor( () => {
			expect( result.current.commentsQuery.comments ).toEqual(
				expect.arrayContaining( [
					expect.objectContaining( {
						content: 'Nope',
						isPlaceholder: true,
						placeholderState: 'ERROR',
					} ),
				] )
			);
		} );
	} );
} );
