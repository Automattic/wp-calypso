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

// Mock Date.prototype.toLocaleString to ensure consistent formatting across environments
const originalToLocaleString = Date.prototype.toLocaleString;
beforeAll( () => {
	Date.prototype.toLocaleString = function (
		locales?: string | string[],
		options?: Intl.DateTimeFormatOptions
	) {
		// Force British English format to match expected test outputs
		return originalToLocaleString.call( this, 'en-GB', options );
	};
} );

afterAll( () => {
	Date.prototype.toLocaleString = originalToLocaleString;
} );

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

	it( 'should format next payout date with year', () => {
		const { result } = renderHook( () => useGetPayoutData() );

		expect( result.current.nextPayoutDate ).toBe( '1 Jun 2024' );
	} );

	it( 'should format current cycle payout date with year', () => {
		const { result } = renderHook( () => useGetPayoutData() );

		expect( result.current.currentCyclePayoutDate ).toBe( '2 Mar 2024' );
	} );

	it( 'should format current cycle activity window with year', () => {
		const { result } = renderHook( () => useGetPayoutData() );

		expect( result.current.currentCycleActivityWindow ).toBe( '1 Jan 2024 - 31 Mar 2024' );
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

		expect( result.current.nextPayoutActivityWindow ).toBe( '1 Apr 2024 - 30 Jun 2024' );
	} );

	it( 'should handle cross-year date ranges', () => {
		const crossYearWindow = {
			start: new Date( '2023-10-01' ),
			finish: new Date( '2024-01-01' ),
		};
		mockGetNextPayoutDateActivityWindow.mockReturnValue( crossYearWindow );

		const { result } = renderHook( () => useGetPayoutData() );

		expect( result.current.nextPayoutActivityWindow ).toBe( '1 Oct 2023 - 1 Jan 2024' );
	} );
} );
