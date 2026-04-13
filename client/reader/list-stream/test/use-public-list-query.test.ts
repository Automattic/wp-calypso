/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { usePublicListQuery, type PublicListResponse } from '../use-public-list-query';

const mockResponse: PublicListResponse = {
	ID: 12345,
	title: 'Test List',
	slug: 'test-list',
	description: 'A test list',
	owner: 'testuser',
	item_count: 2,
	tags: [ 'Food & Drink', 'Travel' ],
	items: [
		{
			blog_id: 456,
			feed_id: 1234,
			site_name: 'Test Site',
			site_url: 'https://testsite.com',
			fediverse_handle: '@test@testsite.com',
			fediverse_handle_url: 'https://testsite.com/@test',
		},
		{
			blog_id: null,
			feed_id: 5678,
			site_name: 'External Feed',
			site_url: 'https://external.com',
			fediverse_handle: null,
			fediverse_handle_url: null,
		},
	],
};

function createWrapper() {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false } },
	} );
	return function Wrapper( { children }: { children: React.ReactNode } ) {
		return React.createElement( QueryClientProvider, { client: queryClient }, children );
	};
}

describe( 'usePublicListQuery', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'fetches and returns public list data', async () => {
		( global.fetch as jest.Mock ).mockResolvedValueOnce( {
			ok: true,
			json: () => Promise.resolve( mockResponse ),
		} );

		const { result } = renderHook( () => usePublicListQuery( 'testuser', 'test-list' ), {
			wrapper: createWrapper(),
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( result.current.data ).toEqual( mockResponse );
		expect( result.current.data?.tags ).toHaveLength( 2 );
		expect( result.current.data?.items ).toHaveLength( 2 );
		expect( global.fetch ).toHaveBeenCalledWith(
			'https://public-api.wordpress.com/wpcom/v2/read/lists/testuser/test-list'
		);
	} );

	test( 'returns error for missing list', async () => {
		( global.fetch as jest.Mock ).mockResolvedValueOnce( {
			ok: false,
			status: 404,
		} );

		const { result } = renderHook( () => usePublicListQuery( 'testuser', 'nonexistent' ), {
			wrapper: createWrapper(),
		} );

		await waitFor( () => expect( result.current.isError ).toBe( true ) );
	} );

	test( 'does not fetch when owner or slug is empty', () => {
		const { result } = renderHook( () => usePublicListQuery( '', 'test-list' ), {
			wrapper: createWrapper(),
		} );

		expect( result.current.isFetching ).toBe( false );
		expect( global.fetch ).not.toHaveBeenCalled();
	} );
} );
