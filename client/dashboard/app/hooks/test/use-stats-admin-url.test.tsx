/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { useStatsAdminUrl } from '../use-stats-admin-url';
import type { StatsAdminUrlSite } from '../use-stats-admin-url';

const site = {
	ID: 1,
	options: { admin_url: 'https://example.com/wp-admin/' },
	capabilities: { manage_options: true },
};

function mockPremiumAnalyticsEnabled( enabled: boolean ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/wp/v2/sites/1/settings' )
		.query( true )
		.reply( 200, { jetpack_premium_analytics_enabled: enabled } );
}

function renderStatsAdminUrl( testSite: StatsAdminUrlSite, statsPath?: string ) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	const wrapper = ( { children }: { children: React.ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);

	return {
		queryClient,
		...renderHook( () => useStatsAdminUrl( testSite, statsPath ), { wrapper } ),
	};
}

describe( 'useStatsAdminUrl', () => {
	it( 'opens the Premium Analytics dashboard when the site has it switched on', async () => {
		mockPremiumAnalyticsEnabled( true );

		const { result } = renderStatsAdminUrl( site );

		await waitFor( () =>
			expect( result.current ).toBe(
				'https://example.com/wp-admin/admin.php?page=jetpack-premium-analytics-wp-admin&p=%2F'
			)
		);
	} );

	it( 'opens the given Stats path when the site has it switched off', async () => {
		const scope = mockPremiumAnalyticsEnabled( false );

		const { result } = renderStatsAdminUrl( site, 'admin.php?page=stats#!/stats/month/1' );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		expect( result.current ).toBe(
			'https://example.com/wp-admin/admin.php?page=stats#!/stats/month/1'
		);
	} );

	it( 'does not ask a site whose settings the user cannot read', () => {
		const { result, queryClient } = renderStatsAdminUrl( {
			...site,
			capabilities: { manage_options: false },
		} );

		expect( queryClient.isFetching() ).toBe( 0 );
		expect( result.current ).toBe( 'https://example.com/wp-admin/admin.php?page=stats' );
	} );

	it( 'gives no link while the site has not answered, so an early click cannot open classic Stats', () => {
		mockPremiumAnalyticsEnabled( true );

		const { result } = renderStatsAdminUrl( site );

		expect( result.current ).toBeUndefined();
	} );

	it( 'adds the slash an admin URL without a trailing one is missing', async () => {
		mockPremiumAnalyticsEnabled( false );

		const { result } = renderStatsAdminUrl( {
			...site,
			options: { admin_url: 'https://example.com/wp-admin' },
		} );

		await waitFor( () =>
			expect( result.current ).toBe( 'https://example.com/wp-admin/admin.php?page=stats' )
		);
	} );
} );
