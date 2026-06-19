/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { useGetSupportInteractionById } from '../use-get-support-interaction-by-id';

const mockIsTestModeEnvironment = jest.fn();
const mockFetch = jest.fn();

jest.mock( '@automattic/zendesk-client', () => ( {
	isTestModeEnvironment: () => mockIsTestModeEnvironment(),
} ) );

jest.mock( '../handle-support-interactions-fetch', () => ( {
	handleSupportInteractionsFetch: ( ...args: unknown[] ) => mockFetch( ...args ),
} ) );

const renderForInteraction = (
	environment: 'staging' | 'production',
	{ isTestMode }: { isTestMode: boolean }
) => {
	mockIsTestModeEnvironment.mockReturnValue( isTestMode );
	mockFetch.mockResolvedValue( { uuid: 'int-1', environment } );

	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false } },
	} );
	const wrapper = ( { children }: { children: React.ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);

	return renderHook( () => useGetSupportInteractionById( 'int-1' ), { wrapper } );
};

describe( 'useGetSupportInteractionById env check', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'accepts a production interaction when in test mode (local dev / staging proxying production)', async () => {
		const { result } = renderForInteraction( 'production', { isTestMode: true } );

		await waitFor( () => expect( result.current.status ).toBe( 'success' ) );
		expect( result.current.data ).toEqual( { uuid: 'int-1', environment: 'production' } );
	} );

	it( 'accepts a staging interaction when in test mode', async () => {
		const { result } = renderForInteraction( 'staging', { isTestMode: true } );

		await waitFor( () => expect( result.current.status ).toBe( 'success' ) );
		expect( result.current.data ).toEqual( { uuid: 'int-1', environment: 'staging' } );
	} );

	it( 'accepts a production interaction when in production mode', async () => {
		const { result } = renderForInteraction( 'production', { isTestMode: false } );

		await waitFor( () => expect( result.current.status ).toBe( 'success' ) );
		expect( result.current.data ).toEqual( { uuid: 'int-1', environment: 'production' } );
	} );

	it( 'rejects a staging interaction when in production mode', async () => {
		const { result } = renderForInteraction( 'staging', { isTestMode: false } );

		await waitFor( () => expect( result.current.status ).toBe( 'error' ) );
		expect( result.current.error?.message ).toBe( 'Support interaction not found' );
	} );
} );
