/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import React from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import useReadFeedSearchQuery, { FeedSort } from '../use-read-feed-search-query';

jest.mock( 'wpcom-proxy-request', () => jest.fn() );

describe( 'useReadFeedSearchQuery', () => {
	beforeEach( () => {
		jest.mocked( wpcomRequest ).mockResolvedValue( {
			algorithm: 'example_algorithm',
			feeds: [],
			next_page: 'example_next_page',
			total: 0,
		} );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should call wpcomRequest with correct parameters when query is defined', async () => {
		const queryClient = new QueryClient();
		const wrapper = ( { children } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);

		const query = 'example';
		renderHook( () => useReadFeedSearchQuery( { query } ), { wrapper } );

		expect( wpcomRequest ).toHaveBeenCalledWith( {
			path: '/read/feed',
			apiVersion: '1.1',
			method: 'GET',
			query: `q=${ encodeURIComponent( query ) }&exclude_followed=false&sort=${ encodeURIComponent(
				FeedSort.Relevance
			) }`,
		} );
	} );

	it( 'should not call wpcomRequest when query is undefined', () => {
		const queryClient = new QueryClient();
		const wrapper = ( { children } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);

		renderHook( () => useReadFeedSearchQuery( {} ), { wrapper } );

		expect( wpcomRequest ).not.toHaveBeenCalled();
	} );
} );
