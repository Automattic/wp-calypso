/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import request from 'wpcom-proxy-request';
import useCategoriesQuery from '../use-categories-query';

const mockResponse = [
	{
		id: 177,
		count: 0,
		description: '',
		link: 'https://mocksite.wordpress.com/category/art/',
		name: 'Art',
		slug: 'art',
		taxonomy: 'category',
		parent: 0,
		meta: [],
		_links: {},
	},
	{
		id: 1,
		count: 4,
		description: '',
		link: 'https://mocksite.wordpress.com/category/uncategorized/',
		name: 'Uncategorized',
		slug: 'uncategorized',
		taxonomy: 'category',
		parent: 0,
		meta: [],
		_links: {},
	},
];

jest.mock( 'wpcom-proxy-request', () => jest.fn() );

describe( 'useCategoriesQuery', () => {
	let queryClient: QueryClient;
	let wrapper: any;

	beforeEach( () => {
		( request as jest.MockedFunction< typeof request > ).mockReset();

		queryClient = new QueryClient( {
			defaultOptions: {
				queries: {
					retry: false,
				},
			},
		} );

		wrapper = ( { children } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should call request with the right parameters', async () => {
		( request as jest.MockedFunction< typeof request > ).mockResolvedValue( mockResponse );

		const { result } = renderHook( () => useCategoriesQuery( 123 ), { wrapper } );

		await waitFor( () => expect( result.current.isFetched ).toBe( true ) );

		expect( request ).toHaveBeenCalledWith( {
			path: '/sites/123/categories',
			apiNamespace: 'wp/v2',
		} );
	} );

	it( 'should return expected data when successful', async () => {
		( request as jest.MockedFunction< typeof request > ).mockResolvedValue( mockResponse );

		const { result } = renderHook( () => useCategoriesQuery( 123 ), { wrapper } );

		await waitFor( () => expect( result.current.isFetched ).toBe( true ) );

		expect( result.current.data ).toEqual( mockResponse );
	} );

	it( 'should handle empty response', async () => {
		( request as jest.MockedFunction< typeof request > ).mockResolvedValue( [] );

		const { result } = renderHook( () => useCategoriesQuery( 123 ), { wrapper } );

		await waitFor( () => expect( result.current.isFetched ).toBe( true ) );

		expect( result.current.data ).toEqual( [] );
	} );
} );
