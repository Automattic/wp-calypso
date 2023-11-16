/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import requestWithSubkeyFallback from 'calypso/lib/request-with-subkey-fallback/request-with-subkey-fallback';
import useSubscribedNewsletterCategories from '../use-subscribed-newsletter-categories-query';

jest.mock( 'calypso/lib/request-with-subkey-fallback/request-with-subkey-fallback', () =>
	jest.fn()
);

describe( 'useSubscribedNewsletterCategories', () => {
	let queryClient: QueryClient;
	let wrapper: any;

	beforeEach( () => {
		(
			requestWithSubkeyFallback as jest.MockedFunction< typeof requestWithSubkeyFallback >
		 ).mockReset();

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
		(
			requestWithSubkeyFallback as jest.MockedFunction< typeof requestWithSubkeyFallback >
		 ).mockResolvedValue( {
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
		(
			requestWithSubkeyFallback as jest.MockedFunction< typeof requestWithSubkeyFallback >
		 ).mockResolvedValue( {
			newsletter_categories: [],
		} );

		const { result } = renderHook( () => useSubscribedNewsletterCategories( { siteId: 123 } ), {
			wrapper,
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( result.current.data ).toEqual( { newsletterCategories: [] } );
	} );

	it( 'should call request with correct arguments', async () => {
		(
			requestWithSubkeyFallback as jest.MockedFunction< typeof requestWithSubkeyFallback >
		 ).mockResolvedValue( {
			success: true,
		} );

		renderHook( () => useSubscribedNewsletterCategories( { siteId: 123 } ), {
			wrapper,
		} );

		await waitFor( () => expect( requestWithSubkeyFallback ).toHaveBeenCalled() );

		expect( requestWithSubkeyFallback ).toHaveBeenCalledWith(
			false,
			`/sites/123/newsletter-categories/subscriptions`
		);
	} );

	it( 'should include the subscriptionId when being called with one', async () => {
		(
			requestWithSubkeyFallback as jest.MockedFunction< typeof requestWithSubkeyFallback >
		 ).mockResolvedValue( {
			success: true,
		} );

		renderHook( () => useSubscribedNewsletterCategories( { siteId: 123, subscriptionId: 456 } ), {
			wrapper,
		} );

		await waitFor( () => expect( requestWithSubkeyFallback ).toHaveBeenCalled() );

		expect( requestWithSubkeyFallback ).toHaveBeenCalledWith(
			false,
			`/sites/123/newsletter-categories/subscriptions/456`
		);
	} );

	it( 'should call with ?type=wpcom when being passed a user id', async () => {
		(
			requestWithSubkeyFallback as jest.MockedFunction< typeof requestWithSubkeyFallback >
		 ).mockResolvedValue( {
			success: true,
		} );

		renderHook( () => useSubscribedNewsletterCategories( { siteId: 123, userId: 456 } ), {
			wrapper,
		} );

		await waitFor( () => expect( requestWithSubkeyFallback ).toHaveBeenCalled() );

		expect( requestWithSubkeyFallback ).toHaveBeenCalledWith(
			false,
			`/sites/123/newsletter-categories/subscriptions/456?type=wpcom`
		);
	} );
} );
