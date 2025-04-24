/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { useRequestVerificationCode } from '..';
import type { RequestVerificationCodeParams } from '../../../sites-overview/types';

describe( 'useRequestVerificationCode', () => {
	const queryClient = new QueryClient();
	const wrapper = ( { children } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);

	const emailParams = {
		type: 'email',
		value: 'testemail@test.com',
		site_ids: [],
	} as RequestVerificationCodeParams;

	const phoneParams = {
		type: 'sms',
		value: '+93774405234',
		site_ids: [],
		number: '774405234',
		country_code: 'AF',
		country_numeric_code: '+93',
	} as RequestVerificationCodeParams;

	it( 'should return initial values for email contact', async () => {
		const data = { verification_sent: true, email_address: emailParams.value };
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/jetpack-agency/contacts' )
			.reply( 200, data );

		const { result } = renderHook( () => useRequestVerificationCode(), { wrapper } );

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
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/jetpack-agency/contacts' )
			.reply( 200, data );

		const { result } = renderHook( () => useRequestVerificationCode(), { wrapper } );

		expect( result.current.isSuccess ).toBe( false );

		act( () => {
			result.current.mutate( phoneParams );
		} );

		await waitFor( () => {
			expect( result.current.isSuccess ).toBe( true );
			expect( result.current.data ).toEqual( data );
		} );
	} );

	it( 'should set isVerified to true when an error with existing_verified_email_contact code occurs', async () => {
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/jetpack-agency/contacts' )
			.reply( 400, { code: 'existing_verified_email_contact' } );

		const { result } = renderHook( () => useRequestVerificationCode(), { wrapper } );

		act( () => {
			result.current.mutate( emailParams );
		} );

		await waitFor( () => {
			expect( result.current.isVerified ).toBe( true );
		} );
	} );

	it( 'should set isVerified to true when an error with existing_verified_sms_contact code occurs', async () => {
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/jetpack-agency/contacts' )
			.reply( 400, { code: 'existing_verified_sms_contact' } );

		const { result } = renderHook( () => useRequestVerificationCode(), { wrapper } );

		act( () => {
			result.current.mutate( phoneParams );
		} );

		await waitFor( () => {
			expect( result.current.isVerified ).toBe( true );
		} );
	} );
} );
