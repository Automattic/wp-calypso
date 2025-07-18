/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import * as getNextPayoutDate from '../../lib/get-next-payout-date';
import useGetPayoutData from '../use-get-payout-data';

// Mock the dependencies
jest.mock( '../../lib/get-next-payout-date' );

const mockGetNextPayoutDate = getNextPayoutDate.getNextPayoutDate as jest.MockedFunction<
	typeof getNextPayoutDate.getNextPayoutDate
>;
const mockGetCurrentCyclePayoutDate =
	getNextPayoutDate.getCurrentCyclePayoutDate as jest.MockedFunction<
		typeof getNextPayoutDate.getCurrentCyclePayoutDate
	>;
const mockGetNextPayoutDateActivityWindow =
	getNextPayoutDate.getNextPayoutDateActivityWindow as jest.MockedFunction<
		typeof getNextPayoutDate.getNextPayoutDateActivityWindow
	>;
const mockGetCurrentCycleActivityWindow =
	getNextPayoutDate.getCurrentCycleActivityWindow as jest.MockedFunction<
		typeof getNextPayoutDate.getCurrentCycleActivityWindow
	>;

describe( 'useGetPayoutData', () => {
	const mockNextPayoutDate = new Date( '2024-06-01' );
	const mockCurrentCyclePayoutDate = new Date( '2024-03-02' );
	const mockNextPayoutWindow = {
		start: new Date( '2024-01-01' ),
		finish: new Date( '2024-03-31' ),
	};
	const mockCurrentCycleWindow = {
		start: new Date( '2024-01-01' ),
		finish: new Date( '2024-03-31' ),
	};

	beforeEach( () => {
		jest.clearAllMocks();
		mockGetNextPayoutDate.mockReturnValue( mockNextPayoutDate );
		mockGetCurrentCyclePayoutDate.mockReturnValue( mockCurrentCyclePayoutDate );
		mockGetNextPayoutDateActivityWindow.mockReturnValue( mockNextPayoutWindow );
		mockGetCurrentCycleActivityWindow.mockReturnValue( mockCurrentCycleWindow );
	} );

	it( 'should format next payout activity window with year', () => {
		const { result } = renderHook( () => useGetPayoutData() );

		expect( result.current.nextPayoutActivityWindow ).toBe( '1 Jan 2024 - 31 Mar 2024' );
	} );

	it( 'should format next payout date without year', () => {
		const { result } = renderHook( () => useGetPayoutData() );

		expect( result.current.nextPayoutDate ).toBe( '1 June' );
	} );

	it( 'should format current cycle payout date without year', () => {
		const { result } = renderHook( () => useGetPayoutData() );

		expect( result.current.currentCyclePayoutDate ).toBe( '2 Mar' );
	} );

	it( 'should format current cycle activity window without year', () => {
		const { result } = renderHook( () => useGetPayoutData() );

		expect( result.current.currentCycleActivityWindow ).toBe( '1 Jan - 31 Mar' );
	} );

	it( 'should determine if next and current payout dates are different', () => {
		const { result } = renderHook( () => useGetPayoutData() );

		expect( result.current.areNextAndCurrentPayoutDatesEqual ).toBe( false );
	} );

	it( 'should determine if next and current payout dates are the same', () => {
		const sameDateValue = new Date( '2024-06-01' );
		mockGetNextPayoutDate.mockReturnValue( sameDateValue );
		mockGetCurrentCyclePayoutDate.mockReturnValue( sameDateValue );

		const { result } = renderHook( () => useGetPayoutData() );

		expect( result.current.areNextAndCurrentPayoutDatesEqual ).toBe( true );
	} );

	it( 'should handle different activity window date ranges', () => {
		const differentWindow = {
			start: new Date( '2024-04-01' ),
			finish: new Date( '2024-06-30' ),
		};
		mockGetNextPayoutDateActivityWindow.mockReturnValue( differentWindow );

		const { result } = renderHook( () => useGetPayoutData() );

		expect( result.current.nextPayoutActivityWindow ).toBe( '1 Apr 2024 - 30 June 2024' );
	} );

	it( 'should handle cross-year date ranges', () => {
		const crossYearWindow = {
			start: new Date( '2023-10-01' ),
			finish: new Date( '2023-12-31' ),
		};
		mockGetNextPayoutDateActivityWindow.mockReturnValue( crossYearWindow );

		const { result } = renderHook( () => useGetPayoutData() );

		expect( result.current.nextPayoutActivityWindow ).toBe( '1 Oct 2023 - 31 Dec 2023' );
	} );

	it( 'should memoize results', () => {
		const { result, rerender } = renderHook( () => useGetPayoutData() );

		const firstResult = result.current;
		rerender();
		const secondResult = result.current;

		expect( firstResult ).toBe( secondResult );
	} );

	it( 'should call all required functions', () => {
		renderHook( () => useGetPayoutData() );

		expect( mockGetNextPayoutDate ).toHaveBeenCalledWith( expect.any( Date ) );
		expect( mockGetCurrentCyclePayoutDate ).toHaveBeenCalledWith( expect.any( Date ) );
		expect( mockGetNextPayoutDateActivityWindow ).toHaveBeenCalledWith( expect.any( Date ) );
		expect( mockGetCurrentCycleActivityWindow ).toHaveBeenCalledWith( expect.any( Date ) );
	} );

	it( 'should handle February dates correctly', () => {
		const febDate = new Date( '2024-02-15' );
		mockGetNextPayoutDate.mockReturnValue( febDate );

		const { result } = renderHook( () => useGetPayoutData() );

		expect( result.current.nextPayoutDate ).toBe( '15 Feb' );
	} );

	it( 'should handle December dates correctly', () => {
		const decDate = new Date( '2024-12-01' );
		mockGetCurrentCyclePayoutDate.mockReturnValue( decDate );

		const { result } = renderHook( () => useGetPayoutData() );

		expect( result.current.currentCyclePayoutDate ).toBe( '1 Dec' );
	} );
} );
