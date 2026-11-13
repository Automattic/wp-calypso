/**
 * @vitest-environment jsdom
 *
 * Run: yarn test-client client/a8c-for-agencies/sections/migrations/hooks/test/use-can-tag-sites-for-commission.test.ts
 */

import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { type MockedFunction, vi } from 'vitest';
import {
	A4A_MIGRATED_SITE_TAG,
	A4A_MIGRATED_SITE_TAG_PRESSABLE_INCENTIVE_2026,
} from '../../lib/constants';
import useCanTagSitesForCommission from '../use-can-tag-sites-for-commission';
import type { UseQueryResult } from '@tanstack/react-query';

vi.mock( '@tanstack/react-query', async () => ( {
	...( await vi.importActual< typeof import( '@tanstack/react-query' ) >(
		'@tanstack/react-query'
	) ),
	useQuery: vi.fn(),
} ) );

const mockUseQuery = useQuery as MockedFunction< typeof useQuery >;

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

function mockAgencyQuery( agency: ReturnType< typeof mockActiveAgency > | null ) {
	mockUseQuery.mockReturnValue( { data: agency, isLoading: false } as unknown as UseQueryResult );
}

describe( 'useCanTagSitesForCommission', () => {
	beforeEach( () => {
		vi.clearAllMocks();
	} );

	test( 'returns false and omits the incentive tag while the agency is still loading', () => {
		mockUseQuery.mockReturnValue( {
			data: undefined,
			isLoading: true,
		} as unknown as UseQueryResult );

		const { result } = renderHook( () => useCanTagSitesForCommission() );

		expect( result.current.canTagSitesForCommission ).toBe( false );
		expect( result.current.migrationTags ).toEqual( [ A4A_MIGRATED_SITE_TAG ] );
	} );

	test( 'returns canTagSitesForCommission true and includes incentive tag when no start_date', () => {
		mockAgencyQuery( mockActiveAgency() );

		const { result } = renderHook( () => useCanTagSitesForCommission() );

		expect( result.current.canTagSitesForCommission ).toBe( true );
		expect( result.current.migrationTags ).toEqual( [
			A4A_MIGRATED_SITE_TAG,
			A4A_MIGRATED_SITE_TAG_PRESSABLE_INCENTIVE_2026,
		] );
	} );

	test( 'returns true and includes incentive tag when start_date is empty string', () => {
		mockAgencyQuery( mockActiveAgency( '' ) );

		const { result } = renderHook( () => useCanTagSitesForCommission() );

		expect( result.current.canTagSitesForCommission ).toBe( true );
		expect( result.current.migrationTags ).toEqual( [
			A4A_MIGRATED_SITE_TAG,
			A4A_MIGRATED_SITE_TAG_PRESSABLE_INCENTIVE_2026,
		] );
	} );

	test( 'returns true when start_date is on or before cutoff (2025-08-10)', () => {
		mockAgencyQuery( mockActiveAgency( '2025-08-10' ) );

		const { result } = renderHook( () => useCanTagSitesForCommission() );

		expect( result.current.canTagSitesForCommission ).toBe( true );
		expect( result.current.migrationTags ).toEqual( [
			A4A_MIGRATED_SITE_TAG,
			A4A_MIGRATED_SITE_TAG_PRESSABLE_INCENTIVE_2026,
		] );
	} );

	test( 'returns false when start_date is in gap (2025-08-11 to 2026-02-10)', () => {
		mockAgencyQuery( mockActiveAgency( '2025-08-11' ) );

		const { result } = renderHook( () => useCanTagSitesForCommission() );

		expect( result.current.canTagSitesForCommission ).toBe( false );
		expect( result.current.migrationTags ).toEqual( [ A4A_MIGRATED_SITE_TAG ] );
	} );

	test( 'returns true when start_date is on or after promo start (2026-02-11)', () => {
		mockAgencyQuery( mockActiveAgency( '2026-02-11' ) );

		const { result } = renderHook( () => useCanTagSitesForCommission() );

		expect( result.current.canTagSitesForCommission ).toBe( true );
		expect( result.current.migrationTags ).toContain(
			A4A_MIGRATED_SITE_TAG_PRESSABLE_INCENTIVE_2026
		);
	} );
} );
