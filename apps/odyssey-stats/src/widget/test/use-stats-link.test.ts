/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import usePremiumAnalyticsStatusQuery from 'calypso/my-sites/stats/hooks/use-premium-analytics-status-query';
import { optionalConfig } from '../../lib/config-api';
import canCurrentUser from '../../lib/selectors/can-current-user';
import useStatsLink from '../use-stats-link';

jest.mock( 'calypso/my-sites/stats/hooks/use-premium-analytics-status-query', () => jest.fn() );
jest.mock( '../../lib/config-api', () => ( { optionalConfig: jest.fn() } ) );
jest.mock( '../../lib/selectors/can-current-user', () => jest.fn() );
jest.mock( '../../lib/selectors/get-site-admin-url', () => () => 'https://example.com/wp-admin/' );

const STATS_URL = 'https://example.com/wp-admin/admin.php?page=stats#!/stats/post/12/1';

/**
 * @param enabled What the site reports, `undefined` for a Jetpack too old to register the setting.
 * @param canManageOptions Whether the user may read the site settings.
 */
function mockSite( enabled: boolean | undefined, canManageOptions = true ) {
	( canCurrentUser as jest.Mock ).mockReturnValue( canManageOptions );
	( usePremiumAnalyticsStatusQuery as jest.Mock ).mockImplementation(
		( _siteId, queryEnabled ) => ( {
			data: queryEnabled ? enabled : undefined,
		} )
	);
}

function statsLink(
	statsUrl: string,
	route: string | null,
	range?: Parameters< ReturnType< typeof useStatsLink > >[ 2 ]
) {
	const { result } = renderHook( () => useStatsLink( 1 ) );
	return result.current( statsUrl, route, range );
}

describe( 'useStatsLink', () => {
	it( 'opens the dashboard route when the site has Premium Analytics switched on', () => {
		mockSite( true );

		expect( statsLink( STATS_URL, '/post/12' ) ).toBe(
			'https://example.com/wp-admin/admin.php?page=jetpack-premium-analytics-wp-admin&p=%2Fpost%2F12'
		);
	} );

	it( 'keeps the Stats URL on a Jetpack too old to report the setting', () => {
		mockSite( undefined );

		expect( statsLink( STATS_URL, '/post/12' ) ).toBe( STATS_URL );
	} );

	it( 'keeps the Stats URL for a link the dashboard has no page for', () => {
		mockSite( true );

		expect( statsLink( STATS_URL, null ) ).toBe( STATS_URL );
	} );

	it( 'keeps the Stats URL for a user who cannot read the site settings', () => {
		mockSite( true, false );

		expect( statsLink( STATS_URL, '/post/12' ) ).toBe( STATS_URL );
	} );

	it( 'dates a range in the site timezone from the config, not in today’s offset', () => {
		mockSite( true );
		( optionalConfig as jest.Mock ).mockReturnValue( 'America/New_York' );

		const url = new URL(
			statsLink( STATS_URL, '/', {
				from: '2026-03-03',
				to: '2026-03-09',
				gmtOffset: -4,
			} )
		);

		expect( url.searchParams.get( 'p' ) ).toBe(
			'/?from=2026-03-03T00%3A00%3A00.000-05%3A00&to=2026-03-09T23%3A59%3A59.999-04%3A00'
		);
	} );
} );
