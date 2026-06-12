/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import useFetchAllLicenses from 'calypso/a8c-for-agencies/data/purchases/use-fetch-all-licenses';
import useFetchSitesWithPlugins from 'calypso/a8c-for-agencies/data/sites/use-fetch-sites-with-plugins';
import useFetchTaggedSitesForMigration from 'calypso/a8c-for-agencies/sections/migrations/hooks/use-fetch-tagged-sites-for-migration';
import useFetchReferrals from '../../../hooks/use-fetch-referrals';
import useHasCommissionActivity from '../use-has-commission-activity';

jest.mock( '../../../hooks/use-fetch-referrals' );
jest.mock(
	'calypso/a8c-for-agencies/sections/migrations/hooks/use-fetch-tagged-sites-for-migration'
);
jest.mock( 'calypso/a8c-for-agencies/data/purchases/use-fetch-all-licenses' );
jest.mock( 'calypso/a8c-for-agencies/data/sites/use-fetch-sites-with-plugins' );

const mockUseFetchReferrals = useFetchReferrals as jest.MockedFunction< typeof useFetchReferrals >;
const mockUseFetchTaggedSitesForMigration = useFetchTaggedSitesForMigration as jest.MockedFunction<
	typeof useFetchTaggedSitesForMigration
>;
const mockUseFetchAllLicenses = useFetchAllLicenses as jest.MockedFunction<
	typeof useFetchAllLicenses
>;
const mockUseFetchSitesWithPlugins = useFetchSitesWithPlugins as jest.MockedFunction<
	typeof useFetchSitesWithPlugins
>;

type QueryResult< T > = { data: T; isLoading: boolean };

const queryResult = < T >( data: T, isLoading = false ): QueryResult< T > =>
	( { data, isLoading } ) as QueryResult< T >;

const setMocks = ( {
	referrals = [],
	taggedSites = [],
	licenses = { items: [], total: 0 },
	sitesWithPlugins = [],
	loading = {
		referrals: false,
		migrations: false,
		licenses: false,
		plugins: false,
	},
}: {
	referrals?: unknown[];
	taggedSites?: unknown[];
	licenses?: { items: unknown[]; total: number };
	sitesWithPlugins?: unknown[];
	loading?: {
		referrals?: boolean;
		migrations?: boolean;
		licenses?: boolean;
		plugins?: boolean;
	};
} = {} ) => {
	mockUseFetchReferrals.mockReturnValue(
		queryResult( referrals, loading.referrals ) as ReturnType< typeof useFetchReferrals >
	);
	mockUseFetchTaggedSitesForMigration.mockReturnValue(
		queryResult( taggedSites, loading.migrations ) as ReturnType<
			typeof useFetchTaggedSitesForMigration
		>
	);
	mockUseFetchAllLicenses.mockReturnValue(
		queryResult( licenses, loading.licenses ) as ReturnType< typeof useFetchAllLicenses >
	);
	mockUseFetchSitesWithPlugins.mockReturnValue(
		queryResult( sitesWithPlugins, loading.plugins ) as ReturnType<
			typeof useFetchSitesWithPlugins
		>
	);
};

describe( 'useHasCommissionActivity', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'returns hasActivity=false when all data sources are empty', () => {
		setMocks();

		const { result } = renderHook( () => useHasCommissionActivity() );

		expect( result.current.hasActivity ).toBe( false );
		expect( result.current.isLoading ).toBe( false );
	} );

	it( 'returns hasActivity=true when the agency has sent a referral', () => {
		setMocks( { referrals: [ { id: 1 } ] } );

		const { result } = renderHook( () => useHasCommissionActivity() );

		expect( result.current.hasActivity ).toBe( true );
	} );

	it( 'returns hasActivity=true when the agency has migrated a site', () => {
		setMocks( { taggedSites: [ { id: 1 } ] } );

		const { result } = renderHook( () => useHasCommissionActivity() );

		expect( result.current.hasActivity ).toBe( true );
	} );

	it( 'returns hasActivity=true when the agency has a WooPayments license', () => {
		setMocks( { licenses: { items: [ { id: 1 } ], total: 1 } } );

		const { result } = renderHook( () => useHasCommissionActivity() );

		expect( result.current.hasActivity ).toBe( true );
	} );

	it( 'returns hasActivity=true when the agency has a site with the WooPayments plugin', () => {
		setMocks( { sitesWithPlugins: [ { blog_id: 1 } ] } );

		const { result } = renderHook( () => useHasCommissionActivity() );

		expect( result.current.hasActivity ).toBe( true );
	} );

	it.each( [
		[ 'referrals', { referrals: true } ],
		[ 'migrations', { migrations: true } ],
		[ 'licenses', { licenses: true } ],
		[ 'plugins', { plugins: true } ],
	] )( 'returns isLoading=true while %s is still loading', ( _, loading ) => {
		setMocks( { loading } );

		const { result } = renderHook( () => useHasCommissionActivity() );

		expect( result.current.isLoading ).toBe( true );
	} );
} );
