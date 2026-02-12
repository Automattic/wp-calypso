/**
 * @jest-environment jsdom
 *
 * Run: yarn test-client client/a8c-for-agencies/sections/migrations/hooks/test/use-can-tag-sites-for-commission.test.ts
 */

import { renderHook } from '@testing-library/react';
import { useSelector } from 'react-redux';
import {
	A4A_MIGRATED_SITE_TAG,
	A4A_MIGRATED_SITE_TAG_PRESSABLE_INCENTIVE_2026,
} from '../../lib/constants';
import useCanTagSitesForCommission from '../use-can-tag-sites-for-commission';

jest.mock( 'react-redux', () => ( {
	useSelector: jest.fn(),
} ) );

function mockActiveAgency( overrides: Record< string, unknown > = {} ) {
	return {
		id: 1,
		name: 'Test Agency',
		third_party: {
			pressable: {
				usage: {
					start_date: undefined,
					end_date: undefined,
				},
			},
		},
		...overrides,
	};
}

function createState( activeAgency: ReturnType< typeof mockActiveAgency > | null ) {
	return {
		a8cForAgencies: {
			agencies: {
				activeAgency,
			},
		},
	};
}

describe( 'useCanTagSitesForCommission', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'returns canTagSitesForCommission true and includes incentive tag when no start_date', () => {
		const agency = mockActiveAgency();
		jest
			.mocked( useSelector )
			.mockImplementation( ( selector: ( s: unknown ) => unknown ) =>
				selector( createState( agency ) )
			);

		const { result } = renderHook( () => useCanTagSitesForCommission() );

		expect( result.current.canTagSitesForCommission ).toBe( true );
		expect( result.current.migrationTags ).toEqual( [
			A4A_MIGRATED_SITE_TAG,
			A4A_MIGRATED_SITE_TAG_PRESSABLE_INCENTIVE_2026,
		] );
	} );

	it( 'returns canTagSitesForCommission true when start_date is on or before cutoff (2025-08-11)', () => {
		const agency = mockActiveAgency( {
			third_party: {
				pressable: {
					usage: { start_date: '2025-08-11T00:00:00Z', end_date: null },
				},
			},
		} );
		jest
			.mocked( useSelector )
			.mockImplementation( ( selector: ( s: unknown ) => unknown ) =>
				selector( createState( agency ) )
			);

		const { result } = renderHook( () => useCanTagSitesForCommission() );

		expect( result.current.canTagSitesForCommission ).toBe( true );
		expect( result.current.migrationTags ).toContain(
			A4A_MIGRATED_SITE_TAG_PRESSABLE_INCENTIVE_2026
		);
	} );

	it( 'returns canTagSitesForCommission true when start_date is before cutoff', () => {
		const agency = mockActiveAgency( {
			third_party: {
				pressable: {
					usage: { start_date: '2025-08-10', end_date: null },
				},
			},
		} );
		jest
			.mocked( useSelector )
			.mockImplementation( ( selector: ( s: unknown ) => unknown ) =>
				selector( createState( agency ) )
			);

		const { result } = renderHook( () => useCanTagSitesForCommission() );

		expect( result.current.canTagSitesForCommission ).toBe( true );
		expect( result.current.migrationTags ).toEqual( [
			A4A_MIGRATED_SITE_TAG,
			A4A_MIGRATED_SITE_TAG_PRESSABLE_INCENTIVE_2026,
		] );
	} );

	it( 'returns canTagSitesForCommission false when start_date is after cutoff', () => {
		const agency = mockActiveAgency( {
			third_party: {
				pressable: {
					usage: { start_date: '2025-08-12', end_date: null },
				},
			},
		} );
		jest
			.mocked( useSelector )
			.mockImplementation( ( selector: ( s: unknown ) => unknown ) =>
				selector( createState( agency ) )
			);

		const { result } = renderHook( () => useCanTagSitesForCommission() );

		expect( result.current.canTagSitesForCommission ).toBe( false );
		expect( result.current.migrationTags ).toEqual( [ A4A_MIGRATED_SITE_TAG ] );
	} );

	it( 'returns canTagSitesForCommission true when start_date is empty string', () => {
		const agency = mockActiveAgency( {
			third_party: {
				pressable: {
					usage: { start_date: '', end_date: null },
				},
			},
		} );
		jest
			.mocked( useSelector )
			.mockImplementation( ( selector: ( s: unknown ) => unknown ) =>
				selector( createState( agency ) )
			);

		const { result } = renderHook( () => useCanTagSitesForCommission() );

		expect( result.current.canTagSitesForCommission ).toBe( true );
		expect( result.current.migrationTags ).toContain(
			A4A_MIGRATED_SITE_TAG_PRESSABLE_INCENTIVE_2026
		);
	} );
} );
