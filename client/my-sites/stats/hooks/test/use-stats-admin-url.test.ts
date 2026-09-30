/**
 * @jest-environment jsdom
 */
import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { useSelector } from 'calypso/state';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import useStatsAdminUrl from '../use-stats-admin-url';

jest.mock( '@tanstack/react-query', () => ( { useQuery: jest.fn() } ) );
jest.mock( '@automattic/api-queries', () => ( {
	sitePremiumAnalyticsEnabledQuery: jest.fn( () => ( { queryKey: [ 'premium-analytics' ] } ) ),
} ) );
jest.mock( 'calypso/state', () => ( { useSelector: jest.fn() } ) );
jest.mock( 'calypso/state/selectors/can-current-user', () => ( { canCurrentUser: jest.fn() } ) );
jest.mock( 'calypso/state/sites/selectors', () => ( {
	getSiteAdminUrl: ( _state: unknown, _siteId: number, path: string ) =>
		`https://example.com/wp-admin/${ path }`,
} ) );

function mockSite( { canManageOptions = true, premiumAnalyticsEnabled = true } = {} ) {
	( canCurrentUser as jest.Mock ).mockReturnValue( canManageOptions );
	( useQuery as jest.Mock ).mockImplementation( ( { enabled } ) => ( {
		data: enabled ? premiumAnalyticsEnabled : undefined,
	} ) );
}

describe( 'useStatsAdminUrl', () => {
	beforeEach( () => {
		( useSelector as jest.Mock ).mockImplementation( ( selector ) => selector( {} ) );
	} );

	it( 'opens the Premium Analytics dashboard when the site has it switched on', () => {
		mockSite();

		const { result } = renderHook( () => useStatsAdminUrl( 1 ) );

		expect( result.current ).toBe(
			'https://example.com/wp-admin/admin.php?page=jetpack-premium-analytics-wp-admin'
		);
	} );

	it( 'keeps the given Stats path when the site has it switched off', () => {
		mockSite( { premiumAnalyticsEnabled: false } );

		const { result } = renderHook( () =>
			useStatsAdminUrl( 1, 'admin.php?page=stats#!/stats/month/1' )
		);

		expect( result.current ).toBe(
			'https://example.com/wp-admin/admin.php?page=stats#!/stats/month/1'
		);
	} );

	it( 'keeps the Stats link for a user who cannot read the site settings', () => {
		mockSite( { canManageOptions: false } );

		const { result } = renderHook( () => useStatsAdminUrl( 1 ) );

		expect( result.current ).toBe( 'https://example.com/wp-admin/admin.php?page=stats' );
	} );
} );
