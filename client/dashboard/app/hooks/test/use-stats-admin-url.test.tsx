/**
 * @jest-environment jsdom
 */
import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { useStatsAdminUrl } from '../use-stats-admin-url';

jest.mock( '@tanstack/react-query', () => ( { useQuery: jest.fn() } ) );
jest.mock( '@automattic/api-queries', () => ( {
	sitePremiumAnalyticsEnabledQuery: jest.fn( () => ( { queryKey: [ 'premium-analytics' ] } ) ),
} ) );

const site = {
	ID: 1,
	options: { admin_url: 'https://example.com/wp-admin/' },
	capabilities: { manage_options: true },
};

function mockPremiumAnalyticsEnabled( enabled: boolean ) {
	( useQuery as jest.Mock ).mockImplementation( ( options: { enabled?: boolean } ) => ( {
		data: options.enabled ? enabled : undefined,
	} ) );
}

describe( 'useStatsAdminUrl', () => {
	it( 'opens the Premium Analytics dashboard when the site has it switched on', () => {
		mockPremiumAnalyticsEnabled( true );

		const { result } = renderHook( () => useStatsAdminUrl( site ) );

		expect( result.current ).toBe(
			'https://example.com/wp-admin/admin.php?page=jetpack-premium-analytics-wp-admin&p=%2F'
		);
	} );

	it( 'opens the given Stats path when the site has it switched off', () => {
		mockPremiumAnalyticsEnabled( false );

		const { result } = renderHook( () =>
			useStatsAdminUrl( site, 'admin.php?page=stats#!/stats/month/1' )
		);

		expect( result.current ).toBe(
			'https://example.com/wp-admin/admin.php?page=stats#!/stats/month/1'
		);
	} );

	it( 'keeps the Stats link for a user who cannot read the site settings', () => {
		mockPremiumAnalyticsEnabled( true );

		const { result } = renderHook( () =>
			useStatsAdminUrl( { ...site, capabilities: { manage_options: false } } )
		);

		expect( result.current ).toBe( 'https://example.com/wp-admin/admin.php?page=stats' );
	} );

	it( 'adds the slash an admin URL without a trailing one is missing', () => {
		mockPremiumAnalyticsEnabled( false );

		const { result } = renderHook( () =>
			useStatsAdminUrl( { ...site, options: { admin_url: 'https://example.com/wp-admin' } } )
		);

		expect( result.current ).toBe( 'https://example.com/wp-admin/admin.php?page=stats' );
	} );
} );
