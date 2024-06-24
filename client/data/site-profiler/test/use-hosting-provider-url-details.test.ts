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

( useAnalyzeUrlQuery as jest.Mock ).mockReturnValue( {
	data: {},
	isLoading: false,
} );

( useHostingProviderQuery as jest.Mock ).mockReturnValue( {
	data: {
		hosting_provider: {
			slug: 'automattic',
		},
	},
	isLoading: false,
} );

( useHostingProviderName as jest.Mock ).mockReturnValue( 'WordPress.com' );

describe( 'useHostingProviderUrlDetails', () => {
	it( 'returns correct values when the hosting provider is a8c', () => {
		const { result } = renderHook( () => useHostingProviderUrlDetails( 'https://wordpress.com' ) );

		expect( result.current.data ).toEqual( {
			name: 'WordPress.com',
			is_a8c: true,
			is_unknown: false,
			hosting_provider: {
				slug: 'automattic',
			},
			url_data: {},
		} );
	} );

	it( 'returns correct values when the hosting provider is unknown', () => {
		( useHostingProviderQuery as jest.Mock ).mockReturnValue( {
			data: {
				hosting_provider: {
					slug: 'unknown',
				},
			},
			isLoading: false,
		} );

		const { result } = renderHook( () => useHostingProviderUrlDetails( 'https://wordpress.com' ) );

		expect( result.current.data ).toEqual( {
			name: 'WordPress.com',
			is_a8c: false,
			is_unknown: true,
			hosting_provider: {
				slug: 'unknown',
			},
			url_data: {},
		} );
	} );

	it( 'returns correct values when the hosting provider is not found', () => {
		( useHostingProviderQuery as jest.Mock ).mockReturnValue( {
			data: {
				hosting_provider: null,
			},
			isLoading: false,
		} );

		const { result } = renderHook( () => useHostingProviderUrlDetails( 'https://wordpress.com' ) );

		expect( result.current.data ).toEqual( {
			name: 'WordPress.com',
			is_a8c: false,
			is_unknown: true,
			hosting_provider: null,
			url_data: {},
		} );
	} );
} );
