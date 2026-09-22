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
} ) );

const mockUseQuery = useQuery as jest.MockedFunction< typeof useQuery >;

const simpleSite = {
	ID: 1,
	options: { admin_url: 'https://example.com/wp-admin/' },
	capabilities: { view_stats: true },
} as unknown as Site;

describe( 'useStatsSparklinePlugin', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockUseQuery.mockReturnValue( { data: [ 1, 2, 3 ] } as never );
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

	test( 'renders nothing when the user cannot view stats', () => {
		const site = { ...simpleSite, capabilities: { view_stats: false } } as unknown as Site;

		const { result } = renderHook( () => useStatsSparklinePlugin( { site } ) );

		expect( result.current ).toBeUndefined();
	} );
} );
