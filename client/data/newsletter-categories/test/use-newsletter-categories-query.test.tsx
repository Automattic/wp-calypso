/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import request from 'wpcom-proxy-request';
import useNewsletterCategories from '../use-newsletter-categories-query';

jest.mock( 'wpcom-proxy-request', () => jest.fn() );

describe( 'useNewsletterCategories', () => {
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

	it( 'should return expected data when successful', async () => {
		( request as jest.MockedFunction< typeof request > ).mockResolvedValue( {
			newsletter_categories: [
				{ id: 1, name: 'Category 1', slug: 'Slug 1', description: 'Description 1', parent: 1 },
				{ id: 2, name: 'Category 2', slug: 'Slug 2', description: 'Description 2', parent: 2 },
			],
		} );

		const { result } = renderHook( () => useNewsletterCategories( { siteId: 123 } ), { wrapper } );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( result.current.data ).toEqual( {
			newsletterCategories: [
				{ id: 1, name: 'Category 1', slug: 'Slug 1', description: 'Description 1', parent: 1 },
				{ id: 2, name: 'Category 2', slug: 'Slug 2', description: 'Description 2', parent: 2 },
			],
		} );
	} );

	it( 'should handle empty response', async () => {
		( request as jest.MockedFunction< typeof request > ).mockResolvedValue( {
			newsletter_categories: [],
		} );

		const { result } = renderHook( () => useNewsletterCategories( { siteId: 123 } ), { wrapper } );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( result.current.data ).toEqual( { newsletterCategories: [] } );
	} );

	it( 'should call request with correct arguments', async () => {
		( request as jest.MockedFunction< typeof request > ).mockResolvedValue( {
			success: true,
		} );

		renderHook( () => useNewsletterCategories( { siteId: 123 } ), {
			wrapper,
		} );

		await waitFor( () => expect( request ).toHaveBeenCalled() );

		expect( request ).toHaveBeenCalledWith( {
			path: `/sites/123/newsletter-categories`,
			apiVersion: '2',
			apiNamespace: 'wpcom/v2',
		} );
	} );
} );
