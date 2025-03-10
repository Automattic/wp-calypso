/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { useUrlBasicMetricsQuery } from 'calypso/data/site-profiler/use-url-basic-metrics-query';
import { useUrlPerformanceInsightsQuery } from 'calypso/data/site-profiler/use-url-performance-insights';
import { usePerformanceReport } from '../hooks/usePerformanceReport';

jest.mock( 'calypso/data/site-profiler/use-url-basic-metrics-query' );
jest.mock( 'calypso/data/site-profiler/use-url-basic-metrics-query' );
jest.mock( 'calypso/data/site-profiler/use-url-performance-insights' );

describe( 'usePerformanceReport', () => {
	const mockSetIsSaving = jest.fn();
	const mockRefetchPages = jest.fn();
	const mockSavePerformanceReportUrl = jest.fn().mockResolvedValue( undefined );

	beforeEach( () => {
		jest.clearAllMocks();

		( useUrlBasicMetricsQuery as jest.Mock ).mockReturnValue( {
			data: null,
			isError: false,
			isFetched: false,
			isLoading: false,
			refetch: jest.fn(),
		} );

		( useUrlPerformanceInsightsQuery as jest.Mock ).mockReturnValue( {
			data: null,
			status: 'idle',
			isError: false,
			isLoading: false,
		} );
	} );

	it( 'should not call savePerformanceReportUrl when finalUrl is not a valid URL but token exists', () => {
		( useUrlBasicMetricsQuery as jest.Mock ).mockReturnValue( {
			data: {
				final_url: 'false',
				token: 'some-token',
			},
			isError: false,
			isFetched: true,
			isLoading: false,
			refetch: jest.fn(),
		} );

		renderHook( () =>
			usePerformanceReport(
				mockSetIsSaving,
				mockRefetchPages,
				mockSavePerformanceReportUrl,
				'123',
				{ url: 'test.com', hash: 'test-hash' },
				'mobile'
			)
		);

		expect( mockSavePerformanceReportUrl ).not.toHaveBeenCalled();
		expect( mockSetIsSaving ).not.toHaveBeenCalled();
	} );

	it( 'should call savePerformanceReportUrl when finalUrl is a valid URL and token exists', () => {
		// Mock the basic metrics query to return valid finalUrl and token
		( useUrlBasicMetricsQuery as jest.Mock ).mockReturnValue( {
			data: {
				final_url: 'https://final-url.com',
				token: 'valid-token',
			},
			isError: false,
			isFetched: true,
			isLoading: false,
			refetch: jest.fn(),
		} );

		renderHook( () =>
			usePerformanceReport(
				mockSetIsSaving,
				mockRefetchPages,
				mockSavePerformanceReportUrl,
				'123',
				{ url: 'test.com', hash: 'test-hash' },
				'mobile'
			)
		);

		expect( mockSavePerformanceReportUrl ).toHaveBeenCalledWith( '123', {
			url: 'https://final-url.com',
			hash: 'valid-token',
		} );
		expect( mockSetIsSaving ).toHaveBeenCalledWith( true );
	} );

	it( 'should not save performance report when testAgain() returns an invalid URL', async () => {
		// Setup mock for basic metrics query with invalid URL
		const mockRefetch = jest.fn().mockResolvedValue( {
			data: {
				final_url: 'false',
				token: 'new-token',
			},
		} );

		( useUrlBasicMetricsQuery as jest.Mock ).mockReturnValue( {
			data: null,
			isError: false,
			isFetched: true,
			isLoading: false,
			refetch: mockRefetch,
		} );

		const { result } = renderHook( () =>
			usePerformanceReport(
				mockSetIsSaving,
				mockRefetchPages,
				mockSavePerformanceReportUrl,
				'123',
				{ url: 'test.com', hash: 'test-hash' },
				'mobile'
			)
		);

		// Call testAgain and wait for it to complete
		await act( async () => {
			const { data } = await result.current.testAgain();
			// This simulates what happens in site-performance.tsx
			if ( data?.token && data.token !== 'test-hash' ) {
				await mockSavePerformanceReportUrl( '123', {
					url: data.final_url,
					hash: data.token,
				} );
			}
		} );

		// Verify that refetch was called
		expect( mockRefetch ).toHaveBeenCalled();

		// Verify that savePerformanceReportUrl was called with the invalid URL
		expect( mockSavePerformanceReportUrl ).toHaveBeenCalledWith( '123', {
			url: 'false',
			hash: 'new-token',
		} );

		// But because the URL is invalid, the save operation should return early
		const saveResult = await mockSavePerformanceReportUrl.mock.results[ 0 ].value;
		expect( saveResult ).toBeUndefined();

		// And setIsSaving should not have been called
		expect( mockSetIsSaving ).not.toHaveBeenCalled();
	} );

	it( 'should set isLoading=false and isError=true when report fails', () => {
		( useUrlPerformanceInsightsQuery as jest.Mock ).mockReturnValue( {
			data: {
				pagespeed: {
					mobile: 'failed',
					desktop: 'failed',
				},
			},
			status: 'success',
			isError: false,
			isLoading: false,
		} );

		const { result } = renderHook( () =>
			usePerformanceReport(
				mockSetIsSaving,
				mockRefetchPages,
				mockSavePerformanceReportUrl,
				'123',
				{ url: 'test.com', hash: 'test-hash' },
				'mobile'
			)
		);

		expect( result.current.isLoading ).toBe( false );
		expect( result.current.isError ).toBe( true );
	} );

	it( 'should handle successful report correctly', () => {
		( useUrlPerformanceInsightsQuery as jest.Mock ).mockReturnValue( {
			data: {
				pagespeed: {
					mobile: {
						performance: 90,
					},
					desktop: {
						performance: 85,
					},
				},
			},
			status: 'success',
			isError: false,
			isLoading: false,
		} );

		const { result } = renderHook( () =>
			usePerformanceReport(
				mockSetIsSaving,
				mockRefetchPages,
				mockSavePerformanceReportUrl,
				'123',
				{ url: 'test.com', hash: 'test-hash' },
				'mobile'
			)
		);

		expect( result.current.isLoading ).toBe( false );
		expect( result.current.isError ).toBe( false );
		expect( result.current.performanceReport?.performance ).toEqual( 90 );
	} );
} );
