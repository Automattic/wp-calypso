/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import * as useGetPayoutData from '../../hooks/use-get-payout-data';
import PayoutCards from '../payout-cards';

// Mock the dependencies
jest.mock( '../../hooks/use-get-payout-data' );

const mockUseGetPayoutData = useGetPayoutData.default as jest.MockedFunction<
	typeof useGetPayoutData.default
>;

// Mock the ConsolidatedStatsCard component
jest.mock( 'calypso/a8c-for-agencies/components/consolidated-stats-card', () => ( {
	ConsolidatedStatsCard: ( { value, footerText, isLoading }: any ) => (
		<div data-testid="consolidated-stats-card">
			<div data-testid="value">{ value }</div>
			<div data-testid="footer-text">{ footerText }</div>
			{ isLoading && <div data-testid="loading">Loading...</div> }
		</div>
	),
} ) );

describe( 'PayoutCards', () => {
	const mockPayoutData = {
		nextPayoutActivityWindow: '1 Jan 2024 - 31 Mar 2024',
		nextPayoutDate: '1 June',
		currentCyclePayoutDate: '2 Mar',
		currentCycleActivityWindow: '1 Jan - 31 Mar',
		areNextAndCurrentPayoutDatesEqual: false,
		isFullQuarter: true,
	};

	beforeEach( () => {
		jest.clearAllMocks();
		mockUseGetPayoutData.mockReturnValue( mockPayoutData );
	} );

	it( 'should render both payout cards when dates are different', () => {
		render(
			<PayoutCards
				isFetching={ false }
				previousQuarterExpectedCommission={ 100.5 }
				currentQuarterExpectedCommission={ 250.75 }
			/>
		);

		const cards = screen.getAllByTestId( 'consolidated-stats-card' );
		expect( cards ).toHaveLength( 2 );

		// Check previous quarter card
		expect( screen.getByText( '$100.50' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Estimated earnings in previous quarter' ) ).toBeInTheDocument();

		// Check current quarter card
		expect( screen.getByText( '$250.75' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Estimated earnings in current quarter' ) ).toBeInTheDocument();
	} );

	it( 'should render only one payout card when dates are equal', () => {
		mockUseGetPayoutData.mockReturnValue( {
			...mockPayoutData,
			areNextAndCurrentPayoutDatesEqual: true,
		} );

		render(
			<PayoutCards
				isFetching={ false }
				previousQuarterExpectedCommission={ 100.5 }
				currentQuarterExpectedCommission={ 250.75 }
			/>
		);

		const cards = screen.getAllByTestId( 'consolidated-stats-card' );
		expect( cards ).toHaveLength( 1 );

		// Should only show current quarter card
		expect( screen.getByText( '$250.75' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Estimated earnings in current quarter' ) ).toBeInTheDocument();

		// Should not show previous quarter card
		expect( screen.queryByText( '$100.50' ) ).not.toBeInTheDocument();
		expect(
			screen.queryByText( 'Estimated earnings in previous quarter' )
		).not.toBeInTheDocument();
	} );

	it( 'should show loading state when fetching', () => {
		render(
			<PayoutCards
				isFetching
				previousQuarterExpectedCommission={ 100.5 }
				currentQuarterExpectedCommission={ 250.75 }
			/>
		);

		const loadingElements = screen.getAllByTestId( 'loading' );
		expect( loadingElements ).toHaveLength( 2 );
	} );

	it( 'should handle decimal precision correctly', () => {
		render(
			<PayoutCards
				isFetching={ false }
				previousQuarterExpectedCommission={ 123.456 }
				currentQuarterExpectedCommission={ 789.111 }
			/>
		);

		// formatCurrency should handle rounding
		expect( screen.getByText( '$123.46' ) ).toBeInTheDocument();
		expect( screen.getByText( '$789.11' ) ).toBeInTheDocument();
	} );

	it( 'should pass correct props to ConsolidatedStatsCard components', () => {
		render(
			<PayoutCards
				isFetching
				previousQuarterExpectedCommission={ 150.25 }
				currentQuarterExpectedCommission={ 300.5 }
			/>
		);

		const values = screen.getAllByTestId( 'value' );
		const footerTexts = screen.getAllByTestId( 'footer-text' );
		const loadingElements = screen.getAllByTestId( 'loading' );

		expect( values ).toHaveLength( 2 );
		expect( footerTexts ).toHaveLength( 2 );
		expect( loadingElements ).toHaveLength( 2 );

		expect( values[ 0 ] ).toHaveTextContent( '$150.25' );
		expect( values[ 1 ] ).toHaveTextContent( '$300.50' );
		expect( footerTexts[ 0 ] ).toHaveTextContent( 'Estimated earnings in previous quarter' );
		expect( footerTexts[ 1 ] ).toHaveTextContent( 'Estimated earnings in current quarter' );
	} );

	it( 'should render the correct payout cards when the current quarter is not a full quarter and isWooPayments is false', () => {
		mockUseGetPayoutData.mockReturnValue( {
			...mockPayoutData,
			isFullQuarter: false,
		} );

		render(
			<PayoutCards
				isWooPayments={ false }
				isFetching={ false }
				previousQuarterExpectedCommission={ 150.25 }
				currentQuarterExpectedCommission={ 300.75 }
			/>
		);

		const cards = screen.getAllByTestId( 'consolidated-stats-card' );
		expect( cards ).toHaveLength( 2 );

		// Should show both cards and the current quarter card should have the correct footer text
		expect( screen.getByText( '$150.25' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Estimated earnings in previous quarter' ) ).toBeInTheDocument();
		expect( screen.getByText( '$300.75' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Estimated earnings in current quarter' ) ).toBeInTheDocument();
	} );

	it( 'should render the correct payout cards when the current quarter is not a full quarter and isWooPayments is true', () => {
		mockUseGetPayoutData.mockReturnValue( {
			...mockPayoutData,
			isFullQuarter: false,
		} );

		render(
			<PayoutCards
				isWooPayments
				isFetching={ false }
				previousQuarterExpectedCommission={ 150.25 }
				currentQuarterExpectedCommission={ 300.75 }
			/>
		);

		const cards = screen.getAllByTestId( 'consolidated-stats-card' );
		expect( cards ).toHaveLength( 2 );

		// Should show both cards and the current quarter card should have the correct footer text
		expect( screen.getByText( '$150.25' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Estimated earnings in previous quarter' ) ).toBeInTheDocument();
		expect( screen.getByText( '$300.75' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Estimated current quarter earnings to date' ) ).toBeInTheDocument();
	} );
} );
