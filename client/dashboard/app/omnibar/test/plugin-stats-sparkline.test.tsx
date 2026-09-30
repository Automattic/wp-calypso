/**
 * @jest-environment jsdom
 */
import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { useStatsSparklinePlugin } from '../plugin-stats-sparkline';
import type { Site } from '@automattic/api-core';

jest.mock( '@tanstack/react-query', () => ( {
	useQuery: jest.fn(),
} ) );

jest.mock( '@automattic/api-queries', () => ( {
	siteHourlyViewsQuery: jest.fn( () => ( { queryKey: [ 'site-hourly-views' ] } ) ),
	sitePremiumAnalyticsEnabledQuery: jest.fn( () => ( {
		queryKey: [ 'site-premium-analytics-enabled' ],
	} ) ),
} ) );

const mockUseQuery = useQuery as jest.MockedFunction< typeof useQuery >;

const simpleSite = {
	ID: 1,
	options: { admin_url: 'https://example.com/wp-admin/' },
	capabilities: { view_stats: true, manage_options: true },
} as unknown as Site;

function mockQueries() {
	mockUseQuery.mockImplementation( ( ( options: { queryKey: string[]; enabled?: boolean } ) => {
		if ( options.queryKey[ 0 ] !== 'site-premium-analytics-enabled' ) {
			return { data: [ 1, 2, 3 ] };
		}
		return { data: options.enabled === false ? undefined : false };
	} ) as never );
}

describe( 'useStatsSparklinePlugin', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockQueries();
	} );

	test( 'renders the sparkline on a Simple site', () => {
		const { result } = renderHook( () => useStatsSparklinePlugin( { site: simpleSite } ) );

		expect( result.current?.href ).toBe( 'https://example.com/wp-admin/admin.php?page=stats' );
	} );

	test( 'renders the sparkline when the Jetpack site has the Stats module active', () => {
		const site = { ...simpleSite, jetpack: true, jetpack_modules: [ 'stats', 'monitor' ] } as Site;

		const { result } = renderHook( () => useStatsSparklinePlugin( { site } ) );

		expect( result.current ).toBeDefined();
	} );

	// Without the module there is no admin.php?page=stats screen, so the sparkline would link
	// to "Sorry, you are not allowed to access this page".
	test( 'renders nothing when the Jetpack site has the Stats module off', () => {
		const site = { ...simpleSite, jetpack: true, jetpack_modules: [ 'monitor' ] } as Site;

		const { result } = renderHook( () => useStatsSparklinePlugin( { site } ) );

		expect( result.current ).toBeUndefined();
	} );

	test( 'does not ask for the Premium Analytics setting when the sparkline cannot show', () => {
		const site = { ...simpleSite, jetpack: true, jetpack_modules: [ 'monitor' ] } as Site;

		renderHook( () => useStatsSparklinePlugin( { site } ) );

		expect( mockUseQuery ).toHaveBeenCalledWith(
			expect.objectContaining( {
				queryKey: [ 'site-premium-analytics-enabled' ],
				enabled: false,
			} )
		);
	} );

	test( 'renders nothing when the user cannot view stats', () => {
		const site = { ...simpleSite, capabilities: { view_stats: false } } as unknown as Site;

		const { result } = renderHook( () => useStatsSparklinePlugin( { site } ) );

		expect( result.current ).toBeUndefined();
	} );
} );
