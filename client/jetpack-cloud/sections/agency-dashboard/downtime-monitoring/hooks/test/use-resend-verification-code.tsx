/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { useResendVerificationCode } from '..';
import type { ResendVerificationCodeParams } from '../../../sites-overview/types';

describe( 'useResendVerificationCode', () => {
	const queryClient = new QueryClient();
	const wrapper = ( { children } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);

	const emailParams = {
		type: 'email',
		value: 'testemail@test.com',
	} as ResendVerificationCodeParams;

	const phoneParams = {
		type: 'sms',
		value: '+93774405234',
	} as ResendVerificationCodeParams;

	it( 'should return initial values for email contact', async () => {
		const data = { verification_sent: true, email_address: emailParams.value };
		nock( 'https://public-api.wordpress.com:443' )
			.post( '/wpcom/v2/jetpack-agency/contacts/resend-verification' )
			.reply( 200, data );

		const { result } = renderHook( () => useResendVerificationCode(), { wrapper } );

		expect( result.current.isSuccess ).toBe( false );

		act( () => {
			result.current.mutate( emailParams );
		} );

		await waitFor( () => {
			expect( result.current.isSuccess ).toBe( true );
			expect( result.current.data ).toEqual( data );
		} );
	} );

	it( 'should return initial values for SMS contact', async () => {
		const data = { verification_sent: true, phone_number: phoneParams.value };
		nock( 'https://public-api.wordpress.com:443' )
			.post( '/wpcom/v2/jetpack-agency/contacts/resend-verification' )
			.reply( 200, data );

		const { result } = renderHook( () => useResendVerificationCode(), { wrapper } );

		expect( result.current.isSuccess ).toBe( false );

		act( () => {
			result.current.mutate( phoneParams );
		} );

		await waitFor( () => {
			expect( result.current.isSuccess ).toBe( true );
			expect( result.current.data ).toEqual( data );
		} );
	} );
} );
