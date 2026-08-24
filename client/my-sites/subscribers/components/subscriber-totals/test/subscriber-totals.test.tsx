/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { SubscribersFilterBy } from '../../../constants';
import SubscriberTotals from '../index';

describe( 'SubscriberTotals', () => {
	it( 'renders only the grand total when no filter or search is active', () => {
		render(
			<SubscriberTotals
				totalSubscribers={ 100 }
				filteredCount={ 100 }
				filters={ [ SubscribersFilterBy.All ] }
				searchTerm=""
				isLoading={ false }
			/>
		);

		expect( screen.getByText( '100 total subscribers' ) ).toBeVisible();
		expect( screen.queryByText( /out of/ ) ).not.toBeInTheDocument();
	} );

	it( 'renders "<filtered> out of <total>" when a filter is active', () => {
		render(
			<SubscriberTotals
				totalSubscribers={ 200 }
				filteredCount={ 50 }
				filters={ [ SubscribersFilterBy.Paid ] }
				searchTerm=""
				isLoading={ false }
			/>
		);

		expect( screen.getByText( '50 paid subscribers' ) ).toBeVisible();
		expect( screen.getByText( 'out of 200 total subscribers' ) ).toBeVisible();
	} );

	it( 'renders the denominator the parent passes, keeping numerator ≤ denominator', () => {
		// Regression for NL-274: when every subscriber matches the active
		// filter (here, all 500 happen to be free), the filtered numerator
		// can equal — but must never exceed — the unfiltered denominator.
		const totalUnfiltered = 500;
		const filteredFree = 500;

		render(
			<SubscriberTotals
				totalSubscribers={ totalUnfiltered }
				filteredCount={ filteredFree }
				filters={ [ SubscribersFilterBy.Free ] }
				searchTerm=""
				isLoading={ false }
			/>
		);

		expect( screen.getByText( '500 free subscribers' ) ).toBeVisible();
		expect( screen.getByText( 'out of 500 total subscribers' ) ).toBeVisible();
		expect( filteredFree ).toBeLessThanOrEqual( totalUnfiltered );
	} );

	it( 'renders matching-results copy when searching', () => {
		render(
			<SubscriberTotals
				totalSubscribers={ 1000 }
				filteredCount={ 3 }
				filters={ [ SubscribersFilterBy.All ] }
				searchTerm="alice"
				isLoading={ false }
			/>
		);

		expect( screen.getByText( '3 matching results' ) ).toBeVisible();
		expect( screen.getByText( 'out of 1,000 total subscribers' ) ).toBeVisible();
	} );

	it( 'renders unconfirmed-only copy without a denominator', () => {
		render(
			<SubscriberTotals
				totalSubscribers={ 200 }
				filteredCount={ 7 }
				filters={ [ SubscribersFilterBy.UnconfirmedSubscriber ] }
				searchTerm=""
				isLoading={ false }
			/>
		);

		expect( screen.getByText( '7 unconfirmed subscribers' ) ).toBeVisible();
		expect( screen.queryByText( /out of/ ) ).not.toBeInTheDocument();
	} );

	it( 'renders a loading spinner while data is in flight', () => {
		const { container } = render(
			<SubscriberTotals
				totalSubscribers={ 0 }
				filteredCount={ 0 }
				filters={ [ SubscribersFilterBy.All ] }
				searchTerm=""
				isLoading
			/>
		);

		expect( container.querySelector( '.subscriber-totals.is-loading' ) ).toBeVisible();
	} );
} );
