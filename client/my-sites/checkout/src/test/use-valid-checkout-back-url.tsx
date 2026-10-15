/**
 * @jest-environment jsdom
 */
import { siteByIdQuery } from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { useSelector } from 'calypso/state';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import { getSiteId } from 'calypso/state/sites/selectors';
import useValidCheckoutBackUrl from '../hooks/use-valid-checkout-back-url';
import { createTestSite } from './util';
import type { Site } from '@automattic/api-core';
import type { ReactNode } from 'react';

jest.mock( 'calypso/state', () => ( {
	useSelector: jest.fn(),
} ) );
jest.mock( 'calypso/state/selectors/get-initial-query-arguments' );
jest.mock( 'calypso/state/sites/selectors' );

const siteSlug = 'example-site.com';
const siteId = 654;

function renderWithSite( site: Partial< Site > ) {
	const queryClient = new QueryClient();
	const { queryKey } = siteByIdQuery( siteId );
	queryClient.setQueryDefaults( queryKey, { staleTime: Infinity } );
	queryClient.setQueryData( queryKey, createTestSite( { ID: siteId, slug: siteSlug, ...site } ) );
	const wrapper = ( { children }: { children: ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);
	return renderHook( () => useValidCheckoutBackUrl( siteSlug ), { wrapper } );
}

describe( 'useValidCheckoutBackUrl', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		( useSelector as jest.Mock ).mockImplementation( ( selector ) => selector( {} ) );
		( getInitialQueryArguments as jest.Mock ).mockReturnValue( { checkoutBackUrl: undefined } );
		( getSiteId as jest.Mock ).mockReturnValue( siteId );
	} );

	it( 'returns a jetpack pricing back url for non-commerce jetpack sites', () => {
		const { result } = renderWithSite( { jetpack: true } );

		expect( result.current ).toBe( `https://cloud.jetpack.com/pricing/${ siteSlug }` );
	} );

	it( 'returns no back url for commerce garden jetpack sites', () => {
		const { result } = renderWithSite( {
			jetpack: true,
			is_garden: true,
			garden_name: 'commerce',
		} );

		expect( result.current ).toBeUndefined();
	} );

	it( 'returns no back url for atomic sites', () => {
		const { result } = renderWithSite( { jetpack: true, is_wpcom_atomic: true } );

		expect( result.current ).toBeUndefined();
	} );
} );
