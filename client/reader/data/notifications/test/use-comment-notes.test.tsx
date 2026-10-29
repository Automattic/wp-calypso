/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { makeNote } from 'calypso/reader/conversations/inbox/test/helpers';
import { useCommentNotes, useMarkNotesRead } from '../use-comment-notes';
import type { ReactNode } from 'react';

const createWrapper = ( queryClient: QueryClient ) =>
	function Wrapper( { children }: { children: ReactNode } ) {
		return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
	};

const createQueryClient = () =>
	new QueryClient( { defaultOptions: { queries: { retry: false } } } );

describe( 'useCommentNotes', () => {
	afterEach( () => nock.cleanAll() );

	it( 'fetches comment notifications', async () => {
		const notes = [ makeNote( { id: 1 } ), makeNote( { id: 2 } ) ];
		const scope = nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/notifications/' )
			.query( ( query ) => query.type === 'comment' )
			.reply( 200, { notes } );

		const { result } = renderHook( () => useCommentNotes(), {
			wrapper: createWrapper( createQueryClient() ),
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( result.current.data?.map( ( { id } ) => id ) ).toEqual( [ 1, 2 ] );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'returns an empty list when the response has no notes', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/notifications/' )
			.query( true )
			.reply( 200, {} );

		const { result } = renderHook( () => useCommentNotes(), {
			wrapper: createWrapper( createQueryClient() ),
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( result.current.data ).toEqual( [] );
	} );

	it( 'refetches on the given interval', async () => {
		jest.useFakeTimers();
		const scope = nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/notifications/' )
			.query( true )
			.reply( 200, { notes: [ makeNote( { id: 1 } ) ] } )
			.get( '/rest/v1.1/notifications/' )
			.query( true )
			.reply( 200, { notes: [ makeNote( { id: 2 } ), makeNote( { id: 1 } ) ] } );

		try {
			const { result } = renderHook( () => useCommentNotes( { refetchInterval: 60 * 1000 } ), {
				wrapper: createWrapper( createQueryClient() ),
			} );

			await waitFor( () =>
				expect( result.current.data?.map( ( { id } ) => id ) ).toEqual( [ 1 ] )
			);

			await act( async () => {
				await jest.advanceTimersByTimeAsync( 60 * 1000 );
			} );

			await waitFor( () =>
				expect( result.current.data?.map( ( { id } ) => id ) ).toEqual( [ 2, 1 ] )
			);
			expect( scope.isDone() ).toBe( true );
		} finally {
			jest.useRealTimers();
		}
	} );
} );

describe( 'useMarkNotesRead', () => {
	afterEach( () => nock.cleanAll() );

	it( 'marks all given notes as read in a single request', async () => {
		let requestBody: unknown;
		const scope = nock( 'https://public-api.wordpress.com' )
			.post( /\/notifications\/read/, ( body ) => {
				requestBody = body;
				return true;
			} )
			.reply( 200, { success: true } );

		const { result } = renderHook( () => useMarkNotesRead(), {
			wrapper: createWrapper( createQueryClient() ),
		} );

		await act( async () => {
			await result.current.mutateAsync( [ 1, 2 ] );
		} );

		expect( scope.isDone() ).toBe( true );
		expect( requestBody ).toEqual( { counts: { 1: 9999, 2: 9999 } } );
	} );

	it( 'optimistically marks the notes as read in the cache', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/notifications/' )
			.query( true )
			.reply( 200, { notes: [ makeNote( { id: 1 } ), makeNote( { id: 2 } ) ] } );
		nock( 'https://public-api.wordpress.com' )
			.post( /\/notifications\/read/ )
			.reply( 200, { success: true } );
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/notifications/' )
			.query( true )
			.reply( 200, { notes: [ makeNote( { id: 1, read: 1 } ), makeNote( { id: 2 } ) ] } );

		const wrapper = createWrapper( createQueryClient() );
		const { result } = renderHook(
			() => ( { notes: useCommentNotes(), markRead: useMarkNotesRead() } ),
			{ wrapper }
		);

		await waitFor( () => expect( result.current.notes.isSuccess ).toBe( true ) );

		act( () => {
			result.current.markRead.mutate( [ 1 ] );
		} );

		await waitFor( () =>
			expect( result.current.notes.data?.map( ( { id, read } ) => ( { id, read } ) ) ).toEqual( [
				{ id: 1, read: 1 },
				{ id: 2, read: 0 },
			] )
		);
	} );

	it( 'restores the unread state when marking as read fails', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/notifications/' )
			.query( true )
			.times( 2 )
			.reply( 200, { notes: [ makeNote( { id: 1 } ), makeNote( { id: 2 } ) ] } );
		nock( 'https://public-api.wordpress.com' )
			.post( /\/notifications\/read/ )
			.reply( 500, { error: 'server_error', message: 'Something went wrong' } );

		const wrapper = createWrapper( createQueryClient() );
		const { result } = renderHook(
			() => ( { notes: useCommentNotes(), markRead: useMarkNotesRead() } ),
			{ wrapper }
		);

		await waitFor( () => expect( result.current.notes.isSuccess ).toBe( true ) );

		act( () => {
			result.current.markRead.mutate( [ 1 ] );
		} );

		await waitFor( () => expect( result.current.markRead.isError ).toBe( true ) );
		expect( result.current.notes.data?.map( ( { id, read } ) => ( { id, read } ) ) ).toEqual( [
			{ id: 1, read: 0 },
			{ id: 2, read: 0 },
		] );
	} );
} );
