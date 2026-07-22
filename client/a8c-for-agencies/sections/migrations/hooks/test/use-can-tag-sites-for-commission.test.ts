/**
 * @jest-environment jsdom
 *
 * Run: yarn test-client client/a8c-for-agencies/sections/migrations/hooks/test/use-can-tag-sites-for-commission.test.ts
 */

import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import {
	A4A_MIGRATED_SITE_TAG,
	A4A_MIGRATED_SITE_TAG_PRESSABLE_INCENTIVE_2026,
} from '../../lib/constants';
import useCanTagSitesForCommission from '../use-can-tag-sites-for-commission';
import type { UseQueryResult } from '@tanstack/react-query';

jest.mock( '@tanstack/react-query', () => ( {
	...jest.requireActual( '@tanstack/react-query' ),
	useQuery: jest.fn(),
} ) );

const mockUseQuery = useQuery as jest.MockedFunction< typeof useQuery >;

function mockActiveAgency( startDate?: string | null ) {
	return {
		id: 1,
		name: 'Test Agency',
		third_party: {
			pressable: {
				usage: {
					start_date: startDate ?? undefined,
				},
			},
		},
	};
}

function mockAgencyQuery(
	agency: ReturnType< typeof mockActiveAgency > | null,
	isLoading = false
) {
	mockUseQuery.mockReturnValue( { data: agency, isLoading } as unknown as UseQueryResult );
}

describe( 'useCanTagSitesForCommission', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'returns canTagSitesForCommission true and includes incentive tag when no start_date', () => {
		mockAgencyQuery( mockActiveAgency() );

		const { result } = renderHook( () => useCanTagSitesForCommission() );

		expect( result.current.canTagSitesForCommission ).toBe( true );
		expect( result.current.migrationTags ).toEqual( [
			A4A_MIGRATED_SITE_TAG,
			A4A_MIGRATED_SITE_TAG_PRESSABLE_INCENTIVE_2026,
		] );
	} );

	it( 'returns true and includes incentive tag when start_date is empty string', () => {
		mockAgencyQuery( mockActiveAgency( '' ) );

		const { result } = renderHook( () => useCanTagSitesForCommission() );

		expect( result.current.canTagSitesForCommission ).toBe( true );
		expect( result.current.migrationTags ).toEqual( [
			A4A_MIGRATED_SITE_TAG,
			A4A_MIGRATED_SITE_TAG_PRESSABLE_INCENTIVE_2026,
		] );
	} );

	it( 'returns true when start_date is on or before cutoff (2025-08-10)', () => {
		mockAgencyQuery( mockActiveAgency( '2025-08-10' ) );

		const { result } = renderHook( () => useCanTagSitesForCommission() );

		expect( result.current.canTagSitesForCommission ).toBe( true );
		expect( result.current.migrationTags ).toEqual( [
			A4A_MIGRATED_SITE_TAG,
			A4A_MIGRATED_SITE_TAG_PRESSABLE_INCENTIVE_2026,
		] );
	} );

	it( 'returns false when start_date is in gap (2025-08-11 to 2026-02-10)', () => {
		mockAgencyQuery( mockActiveAgency( '2025-08-11' ) );

		const { result } = renderHook( () => useCanTagSitesForCommission() );

		expect( result.current.canTagSitesForCommission ).toBe( false );
		expect( result.current.migrationTags ).toEqual( [ A4A_MIGRATED_SITE_TAG ] );
	} );

	it( 'returns true when start_date is on or after promo start (2026-02-11)', () => {
		mockAgencyQuery( mockActiveAgency( '2026-02-11' ) );

		const { result } = renderHook( () => useCanTagSitesForCommission() );

		expect( result.current.canTagSitesForCommission ).toBe( true );
		expect( result.current.migrationTags ).toContain(
			A4A_MIGRATED_SITE_TAG_PRESSABLE_INCENTIVE_2026
		);
	} );

	it( 'surfaces the agency query loading state', () => {
		mockAgencyQuery( null, true );

		const { result } = renderHook( () => useCanTagSitesForCommission() );

		expect( result.current.isLoading ).toBe( true );
	} );
} );
