/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { waitFor } from '@testing-library/dom';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { act } from 'react-dom/test-utils';
import wpcomRequest from 'wpcom-proxy-request';
import { useSiteResetMutation } from '../use-site-reset-mutation';

jest.mock( 'wpcom-proxy-request', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

describe( 'use-site-reset-mutation hook', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'returns success from the api', async () => {
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		const wrapper = ( { children } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);

		const expected = {
			success: true,
		};

		( wpcomRequest as jest.Mock ).mockImplementation( () => Promise.resolve( expected ) );

		const { result } = renderHook( () => useSiteResetMutation(), {
			wrapper,
		} );

		expect( result.current.isSuccess ).toBe( false );

		act( () => {
			result.current.resetSite( 123 );
		} );

		await waitFor( () => {
			expect( result.current.isSuccess ).toBe( true );
			expect( result.current.data ).toEqual( expected );
		} );
	} );

	test( 'returns failure from the api', async () => {
		const queryClient = new QueryClient();
		const wrapper = ( { children } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);

		const error = {
			code: 'Unauthorized',
			message: 'Something went wrong',
		};

		( wpcomRequest as jest.Mock ).mockImplementation( () => Promise.reject( error ) );

		const { result } = renderHook( () => useSiteResetMutation(), {
			wrapper,
		} );

		act( () => {
			result.current.resetSite( 123 );
		} );

		await waitFor( () => {
			expect( result.current.isError ).toBe( true );
			expect( result.current.error ).toEqual( error );
		} );
	} );
} );
