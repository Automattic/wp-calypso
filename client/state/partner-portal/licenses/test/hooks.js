/**
 * @jest-environment jsdom
 */
/**
 * External dependencies
 */
import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import nock from 'nock';
import { QueryClient, QueryClientProvider } from 'react-query';

/**
 * Internal dependencies
 */
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import useIssueLicenseMutation from 'calypso/state/partner-portal/licenses/hooks/use-issue-license-mutation';

describe( 'useProductsQuery', () => {
	it( 'returns successful request data', async () => {
		const queryClient = new QueryClient();
		const wrapper = ( { children } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);
		const stub = [
			{
				name: 'Jetpack Scan',
				slug: 'jetpack-scan',
				products: [
					{
						name: 'Jetpack Scan Daily',
						product_id: 2106,
						slug: 'jetpack-scan',
					},
				],
			},
			{
				name: 'Jetpack Backup',
				slug: 'jetpack-backup',
				products: [
					{
						name: 'Jetpack Backup (Daily)',
						product_id: 2100,
						slug: 'jetpack-backup-daily',
					},
					{
						name: 'Jetpack Backup (Real-time)',
						product_id: 2102,
						slug: 'jetpack-backup-realtime',
					},
				],
			},
		];

		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/jetpack-licensing/product-families' )
			.reply( 200, stub );

		const { result, waitFor } = renderHook( () => useProductsQuery(), {
			wrapper,
		} );

		await waitFor( () => result.current.isSuccess );

		expect( result.current.data ).toEqual( stub );
	} );
} );

describe( 'useIssueLicenseMutation', () => {
	it( 'returns successful request data', async () => {
		const queryClient = new QueryClient();
		const wrapper = ( { children } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);
		const stub = {
			issued_at: '2021-03-30 15:17:42',
			license_id: 12345,
			license_key: 'jetpack-scan_foobarbaz',
			revoked_at: null,
		};

		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/jetpack-licensing/license', '{"product":"jetpack-scan"}' )
			.reply( 200, stub );

		const { result } = renderHook( () => useIssueLicenseMutation(), {
			wrapper,
		} );

		await act( async () => result.current.mutateAsync( { product: 'jetpack-scan' } ) );

		expect( result.current.data ).toEqual( stub );
	} );
} );
