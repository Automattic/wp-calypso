/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useAnalyzeUrlQuery } from 'calypso/data/site-profiler/use-analyze-url-query';
import { useHostingProviderQuery } from 'calypso/data/site-profiler/use-hosting-provider-query';
import useHostingProviderName from 'calypso/site-profiler/hooks/use-hosting-provider-name';
import { useHostingProviderUrlDetails } from '../use-hosting-provider-url-details';

jest.mock( 'calypso/data/site-profiler/use-analyze-url-query' );
jest.mock( 'calypso/data/site-profiler/use-hosting-provider-query' );
jest.mock( 'calypso/site-profiler/hooks/use-hosting-provider-name' );

describe( 'useHostingProviderUrlDetails', () => {
	it.each( [
		{
			name: 'WordPress.com',
			hosting_provider: { slug: 'automattic' },
			url_data: { url: 'https://wordpress.com' },
			isLoading: false,
			expected: { is_a8c: true, is_unknown: false },
		},
		{
			name: 'Unknown',
			hosting_provider: { slug: 'unknown' },
			url_data: { url: 'https://unknown.com' },
			isLoading: false,
			expected: { is_a8c: false, is_unknown: true },
		},
		{
			name: 'Unknown',
			hosting_provider: null,
			url_data: { url: 'https://unknown.com' },
			isLoading: true,
			expected: { is_a8c: false, is_unknown: true },
		},
	] )( 'returns correct values', ( { name, hosting_provider, url_data, isLoading, expected } ) => {
		( useHostingProviderQuery as jest.Mock ).mockReturnValue( {
			data: {
				hosting_provider,
			},
			isLoading,
		} );

		( useAnalyzeUrlQuery as jest.Mock ).mockReturnValue( {
			data: url_data,
			isLoading,
		} );

		( useHostingProviderName as jest.Mock ).mockReturnValue( name );

		const { result } = renderHook( () => useHostingProviderUrlDetails( 'https://wordpress.com' ) );

		expect( result.current ).toEqual( {
			data: {
				name,
				is_a8c: expected.is_a8c,
				is_unknown: expected.is_unknown,
				hosting_provider,
				url_data,
			},
			isLoading,
		} );
	} );
} );
