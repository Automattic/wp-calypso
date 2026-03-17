/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { wpcom } from '../../wpcom-request';
import { useNewsletterCategories } from '../index';

jest.mock( '../../wpcom-request', () => ( {
	wpcom: {
		req: {
			get: jest.fn(),
			post: jest.fn(),
		},
	},
} ) );

describe( 'useNewsletterCategories', () => {
	let queryClient: QueryClient;
	let wrapper: React.FC< { children: React.ReactNode } >;

	beforeEach( () => {
		jest.mocked( wpcom.req.get ).mockReset();

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
		jest.mocked( wpcom.req.get ).mockResolvedValue( {
			enabled: true,
			newsletter_categories: [
				{ id: 1, name: 'Category 1', slug: 'Slug 1', description: 'Description 1', parent: 1 },
				{ id: 2, name: 'Category 2', slug: 'Slug 2', description: 'Description 2', parent: 2 },
			],
		} );

		const { result } = renderHook( () => useNewsletterCategories( { siteId: 123 } ), { wrapper } );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( result.current.data ).toEqual( {
			enabled: true,
			newsletterCategories: [
				{ id: 1, name: 'Category 1', slug: 'Slug 1', description: 'Description 1', parent: 1 },
				{ id: 2, name: 'Category 2', slug: 'Slug 2', description: 'Description 2', parent: 2 },
			],
		} );
	} );

	it( 'should handle empty response', async () => {
		jest.mocked( wpcom.req.get ).mockResolvedValue( {
			enabled: false,
			newsletter_categories: [],
		} );

		const { result } = renderHook( () => useNewsletterCategories( { siteId: 123 } ), { wrapper } );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( result.current.data ).toEqual( { enabled: false, newsletterCategories: [] } );
	} );

	it( 'should call request with correct arguments', async () => {
		jest.mocked( wpcom.req.get ).mockResolvedValue( {
			enabled: true,
			newsletter_categories: [],
		} );

		renderHook( () => useNewsletterCategories( { siteId: 123 } ), {
			wrapper,
		} );

		await waitFor( () => expect( wpcom.req.get ).toHaveBeenCalled() );

		expect( wpcom.req.get ).toHaveBeenCalledWith( {
			path: '/sites/123/newsletter-categories',
			apiNamespace: 'wpcom/v2',
		} );
	} );

	it( 'should handle error response', async () => {
		const errorMessage = 'API Error';
		jest.mocked( wpcom.req.get ).mockRejectedValue( new Error( errorMessage ) );

		const { result } = renderHook( () => useNewsletterCategories( { siteId: 123 } ), { wrapper } );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( result.current.data ).toEqual( {
			enabled: false,
			newsletterCategories: [],
			error: errorMessage,
		} );
	} );
} );
