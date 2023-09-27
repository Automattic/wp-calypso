/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React, { FC, ReactNode } from 'react';
import request from 'wpcom-proxy-request';
import useNewsletterCategoriesBlogSticker from '../use-newsletter-categories-blog-sticker';

jest.mock( 'wpcom-proxy-request', () => jest.fn() );

describe( 'useNewsletterCategoriesBlogSticker', () => {
	let queryClient: QueryClient;
	let wrapper: FC< { children: ReactNode } >;

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

	it( 'should return true when newsletter-categories is in the response', async () => {
		( request as jest.MockedFunction< typeof request > ).mockResolvedValue( [
			'newsletter-categories',
			'some-other-category',
		] );

		const { result } = renderHook( () => useNewsletterCategoriesBlogSticker( { siteId: 123 } ), {
			wrapper,
		} );

		await waitFor( () => expect( result.current ).toBe( true ) );

		expect( result.current ).toEqual( true );
	} );

	it( 'should return false when newsletter-categories is not in the response', async () => {
		( request as jest.MockedFunction< typeof request > ).mockResolvedValue( [
			'some-other-category',
		] );

		const { result } = renderHook( () => useNewsletterCategoriesBlogSticker( { siteId: 123 } ), {
			wrapper,
		} );

		await waitFor( () => expect( result.current ).toBe( false ) );

		expect( result.current ).toEqual( false );
	} );
} );
