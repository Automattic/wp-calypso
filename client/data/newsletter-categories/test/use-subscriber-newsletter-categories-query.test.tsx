/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import request from 'wpcom-proxy-request';
import useSubscriberNewsletterCategories from '../use-subscriber-newsletter-categories-query';

jest.mock( 'wpcom-proxy-request', () => jest.fn() );

describe( 'useSubscriberNewsletterCategories', () => {
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

		const { result } = renderHook( () => useSubscriberNewsletterCategories( { blogId: 123 } ), {
			wrapper,
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( result.current.data ).toEqual( {
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
		( request as jest.MockedFunction< typeof request > ).mockResolvedValue( {
			newsletter_categories: [],
		} );

		const { result } = renderHook( () => useSubscriberNewsletterCategories( { blogId: 123 } ), {
			wrapper,
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( result.current.data ).toEqual( { newsletterCategories: [] } );
	} );
} );
