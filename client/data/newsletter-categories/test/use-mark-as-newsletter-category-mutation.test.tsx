/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import request from 'wpcom-proxy-request';
import { NewsletterCategories } from '../types';
import useMarkAsNewsletterCategoryMutation from '../use-mark-as-newsletter-category-mutation';

jest.mock( 'wpcom-proxy-request', () => jest.fn() );

describe( 'useMarkAsNewsletterCategoryMutation', () => {
	let queryClient: QueryClient;
	let wrapper: any;
	const siteId = 123;
	const categoryId = 1;

	beforeEach( () => {
		( request as jest.MockedFunction< typeof request > ).mockReset();

		queryClient = new QueryClient( {
			defaultOptions: {
				mutations: {
					retry: false,
				},
			},
		} );

		wrapper = ( { children }: React.PropsWithChildren< unknown > ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should call request with correct arguments', async () => {
		( request as jest.MockedFunction< typeof request > ).mockResolvedValue( {
			success: true,
		} );

		const { result } = renderHook( () => useMarkAsNewsletterCategoryMutation( siteId ), {
			wrapper,
		} );

		act( () => {
			result.current.mutate( categoryId );
		} );

		await waitFor( () => expect( request ).toHaveBeenCalled() );

		expect( request ).toHaveBeenCalledWith( {
			path: `/sites/123/newsletter-categories/1`,
			method: 'POST',
			apiVersion: '2',
			apiNamespace: 'wpcom/v2',
		} );
	} );

	it( 'should invalidate cache on mutation', async () => {
		( request as jest.MockedFunction< typeof request > ).mockResolvedValue( {
			success: true,
		} );

		const invalidateQueriesSpy = jest.spyOn( queryClient, 'invalidateQueries' );
		const { result } = renderHook( () => useMarkAsNewsletterCategoryMutation( siteId ), {
			wrapper,
		} );

		await act( async () => {
			await result.current.mutateAsync( categoryId );
		} );

		expect( invalidateQueriesSpy ).toHaveBeenCalledWith( [ 'newsletter-categories', 123 ] );
	} );

	it( 'should throw an error when ID is missing', async () => {
		const { result } = renderHook( () => useMarkAsNewsletterCategoryMutation( siteId ), {
			wrapper,
		} );

		const consoleError = console.error;
		console.error = jest.fn();

		act( () => {
			// @ts-expect-error The mutation doesn't expect category id to be undefined, but we want to test this case.
			result.current.mutate();
		} );

		await waitFor( () => expect( result.current.error ).toEqual( Error( 'ID is missing.' ) ) );

		console.error = consoleError;
	} );

	it( 'should throw an error when API response is unsuccessful', async () => {
		( request as jest.Mock ).mockResolvedValue( { success: false } );

		const { result } = renderHook( () => useMarkAsNewsletterCategoryMutation( siteId ), {
			wrapper,
		} );

		const consoleError = console.error;
		console.error = jest.fn();

		act( () => {
			result.current.mutate( categoryId );
		} );

		await waitFor( () =>
			expect( result.current.error ).toEqual(
				Error( 'Something went wrong while marking category as newsletter category.' )
			)
		);

		console.error = consoleError;
	} );

	it( 'should update optimistically newsletter categories cache', async () => {
		( request as jest.MockedFunction< typeof request > ).mockResolvedValue( {
			success: true,
		} );

		const mockedCategories = [
			{
				id: 200,
				count: 15,
				description: 'Fascinating art styles',
				link: 'https://mocksite.wordpress.com/category/art-styles/',
				name: 'Creative Expressions',
				slug: 'creative-expressions',
				taxonomy: 'category',
				parent: 0,
				meta: [ { key: 'theme', value: 'imagination' } ],
				_links: {},
			},
			{
				id: 10,
				count: 7,
				description: 'Exploring the unknown',
				link: 'https://mocksite.wordpress.com/category/adventures/',
				name: 'Adventures Beyond',
				slug: 'adventures-beyond',
				taxonomy: 'category',
				parent: 0,
				meta: [ { key: 'discovery', value: 'thrills' } ],
				_links: {},
			},
		];

		queryClient.setQueryData( [ 'categories', siteId ], mockedCategories );

		const { result } = renderHook( () => useMarkAsNewsletterCategoryMutation( siteId ), {
			wrapper,
		} );

		await act( async () => {
			await result.current.mutateAsync( 200 );
		} );

		const updatedData = queryClient.getQueryData< NewsletterCategories >( [
			'newsletter-categories',
			siteId,
		] );

		expect( updatedData?.newsletterCategories ).toEqual(
			expect.arrayContaining( [
				expect.objectContaining( {
					id: 200,
					count: 15,
					description: 'Fascinating art styles',
					link: 'https://mocksite.wordpress.com/category/art-styles/',
					name: 'Creative Expressions',
					slug: 'creative-expressions',
					taxonomy: 'category',
					parent: 0,
					meta: [ { key: 'theme', value: 'imagination' } ],
					_links: {},
				} ),
			] )
		);
	} );
} );
