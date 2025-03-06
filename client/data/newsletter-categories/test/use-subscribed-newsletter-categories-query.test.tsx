/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import useSubscribedNewsletterCategories from '../use-subscribed-newsletter-categories-query';

const mockGet = jest.fn();
jest.mock( 'calypso/lib/wp', () => {
	return {
		__esModule: true,
		default: {
			req: {
				get: ( ...args: unknown[] ) => mockGet( ...args ),
			},
		},
	};
} );

describe( 'useSubscribedNewsletterCategories', () => {
	let queryClient: QueryClient;
	let wrapper: any;

	beforeEach( () => {
		mockGet.mockReset();

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
		mockGet.mockResolvedValue( {
			enabled: true,
			newsletter_categories: [
				{
					id: 1,
					name: 'Category 1',
					slug: 'Slug 1',
					description: 'Description 1',
					parent: 1,
					subscribed: true,
				},
				{
					id: 2,
					name: 'Category 2',
					slug: 'Slug 2',
					description: 'Description 2',
					parent: 2,
					subscribed: false,
				},
			],
		} );

		const { result } = renderHook( () => useSubscribedNewsletterCategories( { siteId: 123 } ), {
			wrapper,
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( result.current.data ).toEqual( {
			enabled: true,
			newsletterCategories: [
				{
					id: 1,
					name: 'Category 1',
					slug: 'Slug 1',
					description: 'Description 1',
					parent: 1,
					subscribed: true,
				},
				{
					id: 2,
					name: 'Category 2',
					slug: 'Slug 2',
					description: 'Description 2',
					parent: 2,
					subscribed: false,
				},
			],
		} );
	} );

	it( 'should handle empty response', async () => {
		mockGet.mockResolvedValue( {
			enabled: false,
			newsletter_categories: [],
		} );

		const { result } = renderHook( () => useSubscribedNewsletterCategories( { siteId: 123 } ), {
			wrapper,
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( result.current.data ).toEqual( { enabled: false, newsletterCategories: [] } );
	} );

	it( 'should call request with correct arguments', async () => {
		mockGet.mockResolvedValue( {
			enabled: true,
			newsletter_categories: [],
		} );

		renderHook( () => useSubscribedNewsletterCategories( { siteId: 123 } ), {
			wrapper,
		} );

		await waitFor( () => expect( mockGet ).toHaveBeenCalled() );

		expect( mockGet ).toHaveBeenCalledWith( {
			path: '/sites/123/newsletter-categories/subscriptions',
			apiNamespace: 'wpcom/v2',
		} );
	} );

	it( 'should include the subscriptionId when being called with one', async () => {
		mockGet.mockResolvedValue( {
			enabled: true,
			newsletter_categories: [],
		} );

		renderHook( () => useSubscribedNewsletterCategories( { siteId: 123, subscriptionId: 456 } ), {
			wrapper,
		} );

		await waitFor( () => expect( mockGet ).toHaveBeenCalled() );

		expect( mockGet ).toHaveBeenCalledWith( {
			path: '/sites/123/newsletter-categories/subscriptions/456',
			apiNamespace: 'wpcom/v2',
		} );
	} );

	it( 'should call with ?type=wpcom when being passed a user id', async () => {
		mockGet.mockResolvedValue( {
			enabled: true,
			newsletter_categories: [],
		} );

		renderHook( () => useSubscribedNewsletterCategories( { siteId: 123, userId: 456 } ), {
			wrapper,
		} );

		await waitFor( () => expect( mockGet ).toHaveBeenCalled() );

		expect( mockGet ).toHaveBeenCalledWith( {
			path: '/sites/123/newsletter-categories/subscriptions/456?type=wpcom',
			apiNamespace: 'wpcom/v2',
		} );
	} );
} );
