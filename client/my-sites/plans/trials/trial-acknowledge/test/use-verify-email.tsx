/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import { useVerifyEmail } from '../use-verify-email';

describe( 'use-verify-email hook', () => {
	test( 'returns isVerified false when user is null', async () => {
		const store = createReduxStore( {} );
		const queryClient = new QueryClient();
		const wrapper = ( { children } ) => (
			<Provider store={ store }>
				<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
			</Provider>
		);

		const expected = {
			isVerified: false,
			isSending: false,
			email: '',
			hasUser: false,
			resendEmail: expect.any( Function ),
		};

		const { result } = renderHook( () => useVerifyEmail(), {
			wrapper,
		} );

		expect( result.current ).toEqual( expected );
	} );

	test( 'returns user verified when user is verified', async () => {
		const store = createReduxStore( {
			currentUser: {
				user: {
					email_verified: true,
					email: 'test@mail.com',
				},
			},
		} );
		const queryClient = new QueryClient();
		const wrapper = ( { children } ) => (
			<Provider store={ store }>
				<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
			</Provider>
		);

		const expected = {
			isVerified: true,
			isSending: false,
			email: 'test@mail.com',
			hasUser: true,
			resendEmail: expect.any( Function ),
		};

		const { result } = renderHook( () => useVerifyEmail(), {
			wrapper,
		} );

		expect( result.current ).toEqual( expected );
	} );
} );
