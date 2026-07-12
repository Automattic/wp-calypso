/**
 * @jest-environment jsdom
 */
jest.mock( '@automattic/api-core', () => ( {
	disconnectDomain: jest.fn( () => Promise.resolve( {} ) ),
	transferDomainToSite: jest.fn( () => Promise.resolve( {} ) ),
} ) );

import { QueryClientProvider, useMutation } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { disconnectDomainMutation } from '../domain';
import { transferDomainToSiteMutation } from '../domain-transfer';
import { queryClient } from '../query-client';

function makeWrapper() {
	return function Wrapper( { children }: { children: React.ReactNode } ) {
		return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
	};
}

function invalidatedWithDomainsPrefix( spy: jest.SpyInstance ) {
	return spy.mock.calls.some( ( [ filters ] ) => {
		const queryKey = ( filters as { queryKey?: readonly unknown[] } )?.queryKey;
		return Array.isArray( queryKey ) && JSON.stringify( queryKey ) === JSON.stringify( [ 'domains' ] );
	} );
}

describe( 'domain detach/attach invalidation', () => {
	afterEach( () => jest.restoreAllMocks() );

	it( 'disconnectDomainMutation invalidates the broad [ "domains" ] prefix', async () => {
		const invalidateSpy = jest.spyOn( queryClient, 'invalidateQueries' );
		const { result } = renderHook( () => useMutation( disconnectDomainMutation( 'example.com' ) ), {
			wrapper: makeWrapper(),
		} );

		await act( async () => {
			await result.current.mutateAsync( undefined );
		} );

		expect( invalidatedWithDomainsPrefix( invalidateSpy ) ).toBe( true );
	} );

	it( 'transferDomainToSiteMutation invalidates the broad [ "domains" ] prefix', async () => {
		const invalidateSpy = jest.spyOn( queryClient, 'invalidateQueries' );
		const { result } = renderHook(
			() => useMutation( transferDomainToSiteMutation( 'example.com', 123 ) ),
			{ wrapper: makeWrapper() }
		);

		await act( async () => {
			await result.current.mutateAsync( 456 );
		} );

		expect( invalidatedWithDomainsPrefix( invalidateSpy ) ).toBe( true );
	} );
} );
