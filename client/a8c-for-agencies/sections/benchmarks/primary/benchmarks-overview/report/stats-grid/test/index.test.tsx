/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import useFetchAgencyBenchmarksList from '../../../../../hooks/use-fetch-agency-benchmarks-list';
import useFetchBenchmarksAggregates from '../../../../../hooks/use-fetch-benchmarks-aggregates';
import BenchmarkStatsGrid from '../index';
import StatCard from '../stat-card';
import type { AgencyBenchmark } from '../../../../../constants';

jest.mock( '../../../../../hooks/use-fetch-agency-benchmarks-list', () => jest.fn() );
jest.mock( '../../../../../hooks/use-fetch-benchmarks-aggregates', () => jest.fn() );
jest.mock( '../stat-card', () => ( { __esModule: true, default: jest.fn( () => null ) } ) );

const mockList = useFetchAgencyBenchmarksList as unknown as jest.Mock;
const mockAggregates = useFetchBenchmarksAggregates as unknown as jest.Mock;
const mockStatCard = StatCard as unknown as jest.Mock;

function makeSubmission( quarter: 1 | 2 | 3 | 4, year: number, maturity: number ): AgencyBenchmark {
	return {
		quarter,
		year,
		computed: { ai_maturity_score: maturity },
		gross_margin: 40,
		billable_utilization: 60,
		avg_project_size_usd: 10000,
		win_rate: 30,
		retainer_mrr_usd: 5000,
		avg_time_to_close_days: 20,
		client_retention: 85,
	} as unknown as AgencyBenchmark;
}

const SUBMISSIONS = [
	makeSubmission( 1, 2026, 50 ),
	makeSubmission( 4, 2025, 41 ),
	makeSubmission( 3, 2025, 38 ),
];

describe( 'BenchmarkStatsGrid', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockList.mockReturnValue( { data: SUBMISSIONS, isLoading: false } );
		mockAggregates.mockReturnValue( { data: [], isLoading: false } );
	} );

	it( 'keys the cards and trend to the requested quarter, not the latest submission', () => {
		render( <BenchmarkStatsGrid quarter={ 4 } year={ 2025 } /> );

		// One card per stat-card config (8) when every metric has a value.
		expect( mockStatCard ).toHaveBeenCalledTimes( 8 );

		// First config is `ai_maturity_score`.
		const firstCardProps = mockStatCard.mock.calls[ 0 ][ 0 ];
		expect( firstCardProps.currentValue ).toBe( 41 );
		expect( firstCardProps.previousQuarter ).toEqual( { quarter: 3, year: 2025 } );
		// Trend ends at the requested quarter and does not include Q1 2026.
		expect( firstCardProps.trendPoints.map( ( p: { quarter: unknown } ) => p.quarter ) ).toEqual( [
			{ quarter: 3, year: 2025 },
			{ quarter: 4, year: 2025 },
		] );
	} );

	it( 'renders nothing when the agency has no submission for the requested quarter', () => {
		render( <BenchmarkStatsGrid quarter={ 2 } year={ 2024 } /> );
		expect( mockStatCard ).not.toHaveBeenCalled();
	} );
} );
