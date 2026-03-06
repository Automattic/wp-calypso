/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import useReadFeedSearchQuery, { FeedSort } from '../use-read-feed-search-query';

describe( 'useReadFeedSearchQuery', () => {
	beforeEach( () => {
		nock.disableNetConnect();
	} );

	it( 'returns expected data when with default parameters', async () => {
		const queryClient = new QueryClient();
		const wrapper = ( { children } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);

		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/feed' )
			.query( {
				q: 'example',
				exclude_followed: false,
				sort: FeedSort.Relevance,
			} )
			.once()
			.reply( 200, {
				algorithm: 'example_algorithm',
				feeds: [
					{
						feed_ID: '1',
						blog_ID: '1',
						title: 'Example Feed',
						subscribe_URL: 'https://example.com/rss',
					},
				],
			} );

		const query = 'example';
		const { result } = renderHook( () => useReadFeedSearchQuery( { query } ), { wrapper } );

		await waitFor( () => {
			expect( result.current.data ).toEqual( {
				algorithm: 'example_algorithm',
				feeds: [
					{
						feed_ID: '1',
						blog_ID: '1',
						title: 'Example Feed',
						subscribe_URL: 'https://example.com/rss',
					},
				],
			} );
		} );
	} );

	it( 'returns expected data when with proper filtering and sorting', async () => {
		const queryClient = new QueryClient();
		const wrapper = ( { children } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);

		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/feed' )
			.query( {
				q: 'example',
				exclude_followed: true,
				sort: FeedSort.LastUpdated,
			} )
			.once()
			.reply( 200, {
				algorithm: 'example_algorithm',
				feeds: [
					{
						feed_ID: '1',
						blog_ID: '1',
						title: 'Example Feed',
						subscribe_URL: 'https://example.com/rss',
					},
				],
			} );

		const query = 'example';
		const { result } = renderHook(
			() => useReadFeedSearchQuery( { query, excludeFollowed: true, sort: FeedSort.LastUpdated } ),
			{ wrapper }
		);

		await waitFor( () => {
			expect( result.current.data ).toEqual( {
				algorithm: 'example_algorithm',
				feeds: [
					{
						feed_ID: '1',
						blog_ID: '1',
						title: 'Example Feed',
						subscribe_URL: 'https://example.com/rss',
					},
				],
			} );
		} );
	} );

	it( 'disables the react-query request when there is no query', async () => {
		const queryClient = new QueryClient();
		const wrapper = ( { children } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);

		const { result } = renderHook( () => useReadFeedSearchQuery( { query: undefined } ), {
			wrapper,
		} );

		// Nock throws an error if a request is made when it is not expected.
		await waitFor( () => {
			expect( result.current.isEnabled ).toBe( false );
			expect( result.current.isFetching ).toBe( false );
		} );
	} );
} );
