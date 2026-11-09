/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { useCommentNotes } from '../use-comment-notes';
import type { NotificationNote } from '@automattic/api-core';
import type { ReactNode } from 'react';

const makeNote = ( { id, read = 0 }: { id: number; read?: number } ): NotificationNote => ( {
	id,
	type: 'comment',
	read,
	timestamp: '2024-01-01T00:00:00Z',
	icon: '',
	title: 'Comment',
	noticon: '\uf300',
	meta: { ids: { site: 10, post: 100, comment: id * 1000 } },
	subject: [],
	body: [],
} );

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
} );
