/**
 * @jest-environment jsdom
 */
import { useQueries, useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { useWooPaymentsDashboardData } from '../use-woopayments-dashboard-data';
import type { AgencyWooPaymentsSiteState } from '@automattic/api-core';

jest.mock( '@automattic/api-queries', () => ( {
	activeAgencyQuery: () => ( { queryKey: [ 'agency' ] } ),
	agencyWooPaymentsLicensedSitesQuery: () => ( { queryKey: [ 'lic' ] } ),
	agencyWooPaymentsPluginSitesQuery: () => ( { queryKey: [ 'plug' ] } ),
	agencyWooPaymentsCommissionsQuery: () => ( { queryKey: [ 'comm' ] } ),
	siteTestConnectionQuery: ( blogId: number ) => ( { queryKey: [ 'conn', blogId ] } ),
} ) );

jest.mock( '@tanstack/react-query', () => ( {
	...jest.requireActual( '@tanstack/react-query' ),
	useQuery: jest.fn(),
	useQueries: jest.fn(),
} ) );

const mockUseQuery = useQuery as jest.MockedFunction< typeof useQuery >;
const mockUseQueries = useQueries as jest.MockedFunction< typeof useQueries >;

type Fixtures = {
	agency?: { id: number };
	licensed?: AgencyWooPaymentsSiteState[];
	pluginSites?: AgencyWooPaymentsSiteState[];
	commissions?: unknown;
	connectionResults?: Record< number, boolean >;
};

function setupQueries( {
	agency = { id: 7 },
	licensed = [],
	pluginSites = [],
	commissions = undefined,
	connectionResults = {},
}: Fixtures ) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	mockUseQuery.mockImplementation( ( options: any ) => {
		const key = options.queryKey[ 0 ];
		if ( key === 'agency' ) {
			return { data: agency, isLoading: false } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
		}
		if ( key === 'lic' ) {
			return { data: licensed, isLoading: false } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
		}
		if ( key === 'plug' ) {
			return { data: pluginSites, isLoading: false } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
		}
		if ( key === 'comm' ) {
			return { data: commissions, isLoading: false } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
		}
		return { data: undefined, isLoading: false } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
	} );

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	mockUseQueries.mockImplementation( ( { queries }: any ) => {
		return queries.map( ( q: { queryKey: [ string, number ] } ) => {
			const blogId = q.queryKey[ 1 ];
			return { data: connectionResults[ blogId ], isLoading: false };
		} );
	} );
}

beforeEach( () => {
	jest.clearAllMocks();
} );

describe( 'useWooPaymentsDashboardData', () => {
	test( 'merges, dedupes by blogId, and sorts by state', () => {
		setupQueries( {
			licensed: [ { blogId: 1, siteUrl: 'a', state: '' } ],
			pluginSites: [
				{ blogId: 1, siteUrl: 'a', state: 'active' },
				{ blogId: 2, siteUrl: 'b', state: 'active' },
			],
		} );

		const { result } = renderHook( () => useWooPaymentsDashboardData() );

		expect( result.current.sites.map( ( s ) => s.blogId ) ).toEqual( [ 1, 2 ] );
		expect( result.current.hasSites ).toBe( true );
	} );

	test( 'overrides state to disconnected when the test-connection result is false, and sorts it after active sites', () => {
		setupQueries( {
			licensed: [ { blogId: 1, siteUrl: 'a', state: 'active' } ],
			pluginSites: [
				{ blogId: 1, siteUrl: 'a', state: 'active' },
				{ blogId: 2, siteUrl: 'b', state: 'active' },
			],
			connectionResults: { 1: false },
		} );

		const { result } = renderHook( () => useWooPaymentsDashboardData() );

		expect( result.current.sites.map( ( s ) => s.blogId ) ).toEqual( [ 2, 1 ] );
		expect( result.current.sites.find( ( s ) => s.blogId === 1 )?.state ).toBe( 'disconnected' );
		expect( result.current.hasSites ).toBe( true );
	} );
} );
