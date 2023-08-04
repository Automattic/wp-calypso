import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';
import request from 'wpcom-proxy-request';
import useUnsetNewsletterCategoryMutation from '../use-unset-newsletter-category-mutation';

jest.mock( 'wpcom-proxy-request', () => jest.fn() );

describe( 'useUnsetNewsletterCategoryMutation', () => {
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

		const { result, waitFor } = renderHook( () => useUnsetNewsletterCategoryMutation( siteId ), {
			wrapper,
		} );

		act( () => {
			result.current.mutate( categoryId );
		} );

		await waitFor( () => expect( request ).toHaveBeenCalled() );

		expect( request ).toHaveBeenCalledWith( {
			path: `/sites/123/newsletter-categories/1`,
			method: 'DELETE',
			apiVersion: '2',
			apiNamespace: 'wpcom/v2',
		} );
	} );

	it( 'should invalidate cache on mutation', async () => {
		( request as jest.MockedFunction< typeof request > ).mockResolvedValue( {
			success: true,
		} );

		const invalidateQueriesSpy = jest.spyOn( queryClient, 'invalidateQueries' );
		const { result } = renderHook( () => useUnsetNewsletterCategoryMutation( siteId ), {
			wrapper,
		} );

		await act( async () => {
			await result.current.mutateAsync( categoryId );
		} );

		expect( invalidateQueriesSpy ).toHaveBeenCalledWith( [ `newsletter-categories-123` ] );
	} );

	it( 'should throw an error when ID is missing', async () => {
		const { result, waitFor } = renderHook( () => useUnsetNewsletterCategoryMutation( siteId ), {
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

		const { result, waitFor } = renderHook( () => useUnsetNewsletterCategoryMutation( siteId ), {
			wrapper,
		} );

		const consoleError = console.error;
		console.error = jest.fn();

		act( () => {
			result.current.mutate( categoryId );
		} );

		await waitFor( () =>
			expect( result.current.error ).toEqual(
				Error( 'Something went wrong while setting category as newsletter category.' )
			)
		);

		console.error = consoleError;
	} );
} );
