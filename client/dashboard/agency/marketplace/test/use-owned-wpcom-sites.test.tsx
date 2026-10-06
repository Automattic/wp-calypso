/**
 * @jest-environment jsdom
 */
import { activeAgencyQuery, agencyProductsQuery } from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { agencyLicensesQuery } from '../lib/wpcom-hosting';
import { useOwnedWpcomSites } from '../use-owned-wpcom-sites';
import type { Agency, AgencyProduct, JetpackLicense } from '@automattic/api-core';
import type { PropsWithChildren } from 'react';

const AGENCY_ID = 1;
const plan = {
	slug: 'wpcom-hosting-business',
	family_slug: 'wpcom-hosting',
	product_id: 1008,
} as AgencyProduct;

function renderOwnedSites( type?: 'regular' | 'referral' ) {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false, staleTime: Infinity } },
	} );
	queryClient.setQueryData( activeAgencyQuery().queryKey, { id: AGENCY_ID } as Agency );
	queryClient.setQueryData( agencyProductsQuery( AGENCY_ID ).queryKey, [ plan ] );
	queryClient.setQueryData( agencyLicensesQuery( AGENCY_ID ).queryKey, [
		{ product_id: 1008 },
		{ product_id: 1008 },
		{ product_id: 1008, referral: { id: 5 } },
	] as JetpackLicense[] );

	return renderHook( () => useOwnedWpcomSites( type ), {
		wrapper: ( { children }: PropsWithChildren ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		),
	} );
}

describe( 'useOwnedWpcomSites', () => {
	afterEach( () => {
		sessionStorage.clear();
	} );

	test( 'counts the sites the agency pays for in regular mode', () => {
		const { result } = renderOwnedSites();

		expect( result.current ).toEqual( { ownedSites: 2, isReady: true } );
	} );

	test( 'counts nothing in referral mode', () => {
		sessionStorage.setItem( 'marketplace-type', 'referral' );
		const { result } = renderOwnedSites();

		expect( result.current ).toEqual( { ownedSites: 0, isReady: true } );
	} );

	test( 'counts nothing for a referral page while the marketplace is in regular mode', () => {
		const { result } = renderOwnedSites( 'referral' );

		expect( result.current ).toEqual( { ownedSites: 0, isReady: true } );
	} );

	test( 'counts the owned sites for a regular page while the marketplace is in referral mode', () => {
		sessionStorage.setItem( 'marketplace-type', 'referral' );
		const { result } = renderOwnedSites( 'regular' );

		expect( result.current ).toEqual( { ownedSites: 2, isReady: true } );
	} );
} );
