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

	it( 'returns a jetpack pricing back url for jetpack sites', () => {
		const { result } = renderWithSite( { jetpack: true } );

		expect( result.current ).toBe( `https://cloud.jetpack.com/pricing/${ siteSlug }` );
	} );

	it( 'returns no back url for atomic sites', () => {
		const { result } = renderWithSite( { jetpack: true, is_wpcom_atomic: true } );

		expect( result.current ).toBeUndefined();
	} );
} );

describe( 'useValidCheckoutBackUrl on the Studio checkout', () => {
	function renderSiteless() {
		const queryClient = new QueryClient();
		const wrapper = ( { children }: { children: ReactNode } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);
		return renderHook( () => useValidCheckoutBackUrl( undefined ), { wrapper } );
	}

	beforeEach( () => {
		jest.clearAllMocks();
		( useSelector as jest.Mock ).mockImplementation( ( selector ) => selector( {} ) );
		( getInitialQueryArguments as jest.Mock ).mockReturnValue( {} );
		( getSiteId as jest.Mock ).mockReturnValue( null );
	} );

	afterEach( () => {
		window.history.pushState( {}, '', '/' );
	} );

	it( 'defaults to the Studio website', () => {
		window.history.pushState( {}, '', '/checkout/studio/studio-cloud-monthly' );

		expect( renderSiteless().result.current ).toBe( 'https://wordpress.studio/' );
	} );

	// leaveCheckout takes a back URL over cancel_to, so a default here would swallow the
	// desktop app's own cancel target.
	it.each( [ '?cancel_to=%2Fcheckout%2Fstudio-return%3FstudioSiteId%3Dabc', '?studioSiteId=abc' ] )(
		'leaves the desktop round trip its own cancel target (%s)',
		( search ) => {
			window.history.pushState( {}, '', `/checkout/studio/studio-cloud-monthly${ search }` );

			expect( renderSiteless().result.current ).toBeUndefined();
		}
	);

	it( 'keeps the default when studioSiteId is not one the round trip accepts', () => {
		window.history.pushState( {}, '', '/checkout/studio/studio-cloud-monthly?studioSiteId=' );

		expect( renderSiteless().result.current ).toBe( 'https://wordpress.studio/' );
	} );

	it( 'gives the WordPress.com siteless checkout no default', () => {
		window.history.pushState( {}, '', '/checkout/wpcom/studio-cloud-monthly' );

		expect( renderSiteless().result.current ).toBeUndefined();
	} );

	it( 'accepts a checkoutBackUrl on a Studio host', () => {
		window.history.pushState( {}, '', '/checkout/studio/studio-cloud-monthly' );
		( getInitialQueryArguments as jest.Mock ).mockReturnValue( {
			checkoutBackUrl: 'https://wordpress.studio/pricing',
		} );

		expect( renderSiteless().result.current ).toBe( 'https://wordpress.studio/pricing' );
	} );
} );
