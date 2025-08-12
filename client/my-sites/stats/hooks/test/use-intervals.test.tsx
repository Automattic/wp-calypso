/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import { STATS_PERIOD } from 'calypso/my-sites/stats/constants';
import { useSelector } from 'calypso/state';
import useIntervals from '../use-intervals';

// Mock dependencies
jest.mock( 'calypso/state', () => ( {
	useSelector: jest.fn(),
} ) );

const mockShouldGateStats = jest.fn( () => false );
jest.mock( '../use-should-gate-stats', () => ( {
	shouldGateStats: () => mockShouldGateStats(),
} ) );

describe( 'useIntervals', () => {
	beforeEach( () => {
		( useSelector as jest.Mock ).mockImplementation( ( selector ) => selector( {}, 123 ) );
		mockShouldGateStats.mockReturnValue( false );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should return memoized intervals when nothing changes', () => {
		const { result, rerender } = renderHook( () => useIntervals( 123 ) );
		const firstResult = result.current;

		// Rerender the hook
		rerender();
		const secondResult = result.current;

		// The results should be referentially equal
		expect( secondResult ).toBe( firstResult );
	} );

	it( 'should return different references when siteId changes', () => {
		const { result, rerender } = renderHook( ( props ) => useIntervals( props ), {
			initialProps: 123,
		} );
		const firstResult = result.current;

		// Rerender with different siteId
		rerender( 456 );
		const secondResult = result.current;

		// The results should be different references
		expect( secondResult ).not.toBe( firstResult );
	} );

	it( 'should return different references when gating status changes', () => {
		const { result, rerender } = renderHook( () => useIntervals( 123 ) );
		const firstResult = result.current;

		// Change the gating status
		mockShouldGateStats.mockReturnValue( true );
		rerender();
		const secondResult = result.current;

		// The results should be different references
		expect( secondResult ).not.toBe( firstResult );
	} );

	it( 'should include all interval periods with correct structure', () => {
		const { result } = renderHook( () => useIntervals( 123 ) );

		const periods = [ STATS_PERIOD.DAY, STATS_PERIOD.WEEK, STATS_PERIOD.MONTH, STATS_PERIOD.YEAR ];

		// Check all periods exist
		expect( Object.keys( result.current ) ).toEqual( periods );

		// Check structure of each period
		periods.forEach( ( period ) => {
			expect( result.current[ period ] ).toEqual( {
				id: period,
				label: expect.any( String ),
				statType: expect.any( String ),
				isGated: false,
			} );
		} );
	} );
} );
