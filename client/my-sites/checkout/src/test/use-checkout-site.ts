/**
 * @jest-environment jsdom
 */
import { fetchSite } from '@automattic/api-core';
import { queryClient } from '@automattic/api-queries';
import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import {
	getActivePlanSlug,
	getJetpackCheckoutRedirectUrl,
	getSiteAdminUrl,
	isJetpackNotAtomicSite,
	siteHasPaidPlan,
	useCheckoutSite,
} from '../hooks/use-checkout-site';
import { earlyRequestKeys, resetEarlyRequests, startEarlyRequest } from '../lib/early-requests';
import { createTestSite } from './util';
import type { Site } from '@automattic/api-core';
import type { PropsWithChildren } from 'react';

jest.mock( '@automattic/api-core', () => ( {
	...jest.requireActual( '@automattic/api-core' ),
	fetchSite: jest.fn(),
} ) );

const withPlugins = ( plugins: string[], overrides: Partial< Site > = {} ) =>
	createTestSite( {
		...overrides,
		options: {
			admin_url: 'https://foo.com/wp-admin/',
			software_version: '6.8',
			jetpack_connection_active_plugins: plugins,
		},
	} );

describe( 'isJetpackNotAtomicSite', () => {
	it( 'is false without a site', () => {
		expect( isJetpackNotAtomicSite( undefined ) ).toBe( false );
	} );

	it( 'is false for a simple site', () => {
		expect( isJetpackNotAtomicSite( createTestSite() ) ).toBe( false );
	} );

	it( 'is true for a site with the full Jetpack plugin', () => {
		expect( isJetpackNotAtomicSite( createTestSite( { jetpack: true } ) ) ).toBe( true );
	} );

	it( 'is true for a site with only a standalone Jetpack plugin', () => {
		expect( isJetpackNotAtomicSite( withPlugins( [ 'jetpack-backup' ] ) ) ).toBe( true );
	} );

	it( 'is false for an Atomic site', () => {
		expect(
			isJetpackNotAtomicSite(
				withPlugins( [ 'jetpack' ], { jetpack: true, is_wpcom_atomic: true } )
			)
		).toBe( false );
	} );
} );

describe( 'getJetpackCheckoutRedirectUrl', () => {
	it( 'returns undefined when no known plugin is active', () => {
		expect( getJetpackCheckoutRedirectUrl( withPlugins( [ 'jetpack-search' ] ) ) ).toBeUndefined();
	} );

	it( 'prefers the full Jetpack plugin', () => {
		expect( getJetpackCheckoutRedirectUrl( withPlugins( [ 'jetpack-backup', 'jetpack' ] ) ) ).toBe(
			'admin.php?page=my-jetpack'
		);
	} );

	it( 'returns the first standalone plugin page otherwise', () => {
		expect(
			getJetpackCheckoutRedirectUrl( withPlugins( [ 'jetpack-social', 'jetpack-backup' ] ) )
		).toBe( 'admin.php?page=jetpack-social' );
	} );
} );

describe( 'getActivePlanSlug', () => {
	const plan = { product_slug: 'jetpack_security_daily', expired: false } as Site[ 'plan' ];

	it( 'returns the plan slug', () => {
		expect( getActivePlanSlug( createTestSite( { plan } ) ) ).toBe( 'jetpack_security_daily' );
	} );

	it( 'returns undefined for an expired plan', () => {
		expect(
			getActivePlanSlug( createTestSite( { plan: { ...plan!, expired: true } } ) )
		).toBeUndefined();
	} );
} );

describe( 'siteHasPaidPlan', () => {
	const plan = {
		product_slug: 'personal-bundle',
		is_free: false,
		expired: false,
	} as Site[ 'plan' ];

	it( 'is true for a paid plan', () => {
		expect( siteHasPaidPlan( createTestSite( { plan } ) ) ).toBe( true );
	} );

	it( 'is true for an expired paid plan', () => {
		expect( siteHasPaidPlan( createTestSite( { plan: { ...plan!, expired: true } } ) ) ).toBe(
			true
		);
	} );

	it( 'is false for a free plan', () => {
		expect( siteHasPaidPlan( createTestSite( { plan: { ...plan!, is_free: true } } ) ) ).toBe(
			false
		);
	} );

	it( 'is false without a site', () => {
		expect( siteHasPaidPlan( undefined ) ).toBe( false );
	} );
} );

describe( 'getSiteAdminUrl', () => {
	it( 'appends the path to the admin URL', () => {
		expect( getSiteAdminUrl( createTestSite(), '/update-core.php' ) ).toBe(
			'https://foo.com/wp-admin/update-core.php'
		);
	} );

	it( 'returns undefined without a site', () => {
		expect( getSiteAdminUrl( undefined, 'update-core.php' ) ).toBeUndefined();
	} );
} );

describe( 'useCheckoutSite', () => {
	const wrapper = ( { children }: PropsWithChildren ) =>
		createElement( QueryClientProvider, { client: queryClient }, children );

	beforeEach( () => {
		resetEarlyRequests();
		queryClient.clear();
		jest.mocked( fetchSite ).mockReset();
		jest
			.mocked( fetchSite )
			.mockImplementation( ( siteIdOrSlug ) =>
				Promise.resolve( createTestSite( { ID: Number( siteIdOrSlug ) } ) )
			);
	} );

	it( 'uses the site the checkout route asked for by slug when it is the same site', async () => {
		startEarlyRequest( earlyRequestKeys.site, () =>
			Promise.resolve( createTestSite( { ID: 123 } ) )
		);

		const { result } = renderHook( () => useCheckoutSite( 123 ), { wrapper } );

		await waitFor( () => expect( result.current.data?.ID ).toBe( 123 ) );
		expect( fetchSite ).not.toHaveBeenCalled();
	} );

	it( 'fetches the site when the one the checkout route asked for is another site', async () => {
		startEarlyRequest( earlyRequestKeys.site, () =>
			Promise.resolve( createTestSite( { ID: 999 } ) )
		);

		const { result } = renderHook( () => useCheckoutSite( 124 ), { wrapper } );

		await waitFor( () => expect( result.current.data?.ID ).toBe( 124 ) );
		expect( fetchSite ).toHaveBeenCalledWith( 124 );
	} );

	it( 'fetches the site when the checkout route asked for none', async () => {
		const { result } = renderHook( () => useCheckoutSite( 125 ), { wrapper } );

		await waitFor( () => expect( result.current.data?.ID ).toBe( 125 ) );
		expect( fetchSite ).toHaveBeenCalledWith( 125 );
	} );
} );
