/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { useValidateVerificationCode } from '..';
import type { ValidateVerificationCodeParams } from '../../../sites-overview/types';

describe( 'useValidateVerificationCode', () => {
	const queryClient = new QueryClient();
	const wrapper = ( { children } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);

	const emailParams = {
		type: 'email',
		value: 'testemail@test.com',
		verification_code: 123456,
	} as ValidateVerificationCodeParams;

	const phoneParams = {
		type: 'sms',
		value: '+93774405234',
	} as ValidateVerificationCodeParams;

	it( 'should return initial values for email contact', async () => {
		const data = { verified: true, email_address: emailParams.value };
		nock( 'https://public-api.wordpress.com:443' )
			.post( '/wpcom/v2/jetpack-agency/contacts/verify' )
			.reply( 200, data );

		const { result } = renderHook( () => useValidateVerificationCode(), { wrapper } );

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
		const data = { verified: true, phone_number: phoneParams.value };
		nock( 'https://public-api.wordpress.com:443' )
			.post( '/wpcom/v2/jetpack-agency/contacts/verify' )
			.reply( 200, data );

		const { result } = renderHook( () => useValidateVerificationCode(), { wrapper } );

		expect( result.current.isSuccess ).toBe( false );

		act( () => {
			result.current.mutate( phoneParams );
		} );

		await waitFor( () => {
			expect( result.current.isSuccess ).toBe( true );
			expect( result.current.data ).toEqual( data );
		} );
	} );

	it( 'should set isVerified to true when an error with jetpack_agency_contact_is_verified code occurs', async () => {
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/jetpack-agency/contacts/verify' )
			.reply( 400, { code: 'jetpack_agency_contact_is_verified' } );

		const { result } = renderHook( () => useValidateVerificationCode(), { wrapper } );

		act( () => {
			result.current.mutate( emailParams );
		} );

		await waitFor( () => {
			expect( result.current.isVerified ).toBe( true );
		} );
	} );

	it( 'should show default error message when there is an error', async () => {
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/jetpack-agency/contacts/verify' )
			.reply( 400 );

		const { result } = renderHook( () => useValidateVerificationCode(), { wrapper } );

		act( () => {
			result.current.mutate( emailParams );
		} );

		await waitFor( () => {
			expect( result.current.isError ).toBe( true );
			expect( result.current.errorMessage ).toBe( 'Something went wrong.' );
		} );
	} );

	it( 'should show correct error message when the error code is jetpack_agency_contact_invalid_verification_code', async () => {
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/jetpack-agency/contacts/verify' )
			.reply( 400, { code: 'jetpack_agency_contact_invalid_verification_code' } );

		const { result } = renderHook( () => useValidateVerificationCode(), { wrapper } );

		act( () => {
			result.current.mutate( emailParams );
		} );

		await waitFor( () => {
			expect( result.current.isError ).toBe( true );
			expect( result.current.errorMessage ).toBe( 'Invalid Code' );
		} );
	} );

	it( 'should show correct error message when the error code is jetpack_agency_contact_expired_verification_code', async () => {
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/jetpack-agency/contacts/verify' )
			.reply( 400, { code: 'jetpack_agency_contact_expired_verification_code' } );

		const { result } = renderHook( () => useValidateVerificationCode(), { wrapper } );

		act( () => {
			result.current.mutate( phoneParams );
		} );

		await waitFor( () => {
			expect( result.current.isError ).toBe( true );
			expect( result.current.errorMessage ).toBe( 'Code Expired' );
		} );
	} );
} );
