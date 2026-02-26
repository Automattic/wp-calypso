/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { when } from 'jest-when';
import React from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import useReadFeedSearchQuery, { FeedSort } from '../use-read-feed-search-query';

jest.mock( 'wpcom-proxy-request', () => jest.fn() );

describe( 'useReadFeedSearchQuery', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	const wrapper = ( { children } ) => {
		return <QueryClientProvider client={ new QueryClient() }>{ children }</QueryClientProvider>;
	};

	it( 'returns the feeds results from the api call', async () => {
		const query = 'example';

		// Mock the wpcomRequest has an implementation issue which blocks the nock usage, so we use jest-when to mock the response
		when( wpcomRequest )
			.calledWith( {
				path: '/read/feed',
				apiVersion: '1.1',
				method: 'GET',
				query: `q=${ encodeURIComponent(
					query
				) }&exclude_followed=false&sort=${ encodeURIComponent( FeedSort.Relevance ) }`,
			} )
			.mockResolvedValue( {
				algorithm: 'example_algorithm',
				feeds: [
					{
						id: '1',
						name: 'Example Feed',
						URL: 'https://example.com',
					},
				],
			} );

		const { result } = renderHook( () => useReadFeedSearchQuery( { query } ), {
			wrapper,
		} );

		await waitFor( () => {
			expect( result.current.data ).toEqual( {
				algorithm: 'example_algorithm',
				feeds: [
					{
						id: '1',
						name: 'Example Feed',
						URL: 'https://example.com',
					},
				],
			} );
		} );
	} );

	it( 'does not call wpcomRequest when query is undefined', () => {
		renderHook( () => useReadFeedSearchQuery( {} ), { wrapper } );

		expect( wpcomRequest ).not.toHaveBeenCalled();
	} );
} );
