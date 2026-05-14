/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { useSitePerformancePageReports } from '../hooks/useSitePerformancePageReports';

jest.mock( 'wpcom-proxy-request' );

jest.mock( '@wordpress/react-i18n', () => ( {
	useI18n: () => ( { __: ( text: string ) => text } ),
} ) );

jest.mock( 'calypso/state', () => ( {
	useSelector: ( selector: ( state: unknown ) => unknown ) => selector( {} ),
	useDispatch: () => jest.fn(),
} ) );

jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSite: () => ( {
		ID: 1,
		URL: 'https://example.com',
		slug: 'example-com',
	} ),
} ) );

jest.mock( 'calypso/state/site-settings/actions', () => ( {
	saveSiteSettings: jest.fn(),
} ) );

jest.mock( 'calypso/blocks/plugins-scheduled-updates/hooks/use-site-settings', () => ( {
	useSiteSettings: () => ( { getSiteSetting: () => '' } ),
} ) );

function createWrapper() {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	const Wrapper = ( { children }: { children: React.ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);
	return Wrapper;
}

describe( 'useSitePerformancePageReports', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'uses "No Title" fallback when page title is null', async () => {
		( wpcomRequest as jest.Mock ).mockResolvedValue( [
			{
				id: 1,
				link: 'https://example.com/about',
				title: null,
				wpcom_performance_report_url: '',
			},
		] );

		const { result } = renderHook( () => useSitePerformancePageReports(), {
			wrapper: createWrapper(),
		} );

		await waitFor( () => {
			const page = result.current.pages.find( ( p ) => p.value === '1' );
			expect( page?.label ).toBe( 'No Title' );
		} );
	} );

	test( 'uses "No Title" fallback when page title rendered is empty string', async () => {
		( wpcomRequest as jest.Mock ).mockResolvedValue( [
			{
				id: 2,
				link: 'https://example.com/contact',
				title: { rendered: '' },
				wpcom_performance_report_url: '',
			},
		] );

		const { result } = renderHook( () => useSitePerformancePageReports(), {
			wrapper: createWrapper(),
		} );

		await waitFor( () => {
			const page = result.current.pages.find( ( p ) => p.value === '2' );
			expect( page?.label ).toBe( 'No Title' );
		} );
	} );

	test( 'uses the rendered title when it is present', async () => {
		( wpcomRequest as jest.Mock ).mockResolvedValue( [
			{
				id: 3,
				link: 'https://example.com/about',
				title: { rendered: 'About Us' },
				wpcom_performance_report_url: '',
			},
		] );

		const { result } = renderHook( () => useSitePerformancePageReports(), {
			wrapper: createWrapper(),
		} );

		await waitFor( () => {
			const page = result.current.pages.find( ( p ) => p.value === '3' );
			expect( page?.label ).toBe( 'About Us' );
		} );
	} );
} );
