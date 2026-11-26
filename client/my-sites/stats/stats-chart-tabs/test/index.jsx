/**
 * @vitest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { vi } from 'vitest';
import { fetch, onError, onSuccess } from 'calypso/state/data-layer/wpcom/sites/stats/visits';
import { requestChartCounts } from 'calypso/state/stats/chart-tabs/actions';
import chartTabsReducer from 'calypso/state/stats/chart-tabs/reducer';
import StatModuleChartTabs from '../';

vi.mock( '@automattic/viewport-react', () => ( {
	withMobileBreakpoint: ( component ) => component,
} ) );
vi.mock( 'calypso/lib/performance-tracking', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		withPerformanceTrackerStop: ( component ) => component,
	} )
);
vi.mock( 'calypso/state/ui/selectors', () => ( { getSelectedSiteId: () => 1 } ) );
vi.mock( 'calypso/state/sites/selectors', () => ( { getSiteOption: () => 0 } ) );
vi.mock( '../../stats-tabs', () => ( { default: () => null } ) );
vi.mock( '../chart-header', () => ( { default: () => null } ) );
vi.mock( 'calypso/components/chart', () => ( {
	default: ( { data } ) => <div data-testid="traffic-chart">{ data[ 0 ]?.value } views</div>,
} ) );

describe( 'Stats chart request recovery', () => {
	beforeEach( () => vi.useFakeTimers() );
	afterEach( () => {
		vi.clearAllTimers();
		vi.useRealTimers();
	} );

	it( 'replaces the spinner with an error after failure and shows data after a successful retry', () => {
		const store = createStore( ( state, action ) => ( {
			stats: { chartTabs: chartTabsReducer( state?.stats.chartTabs, action ) },
		} ) );
		const query = {
			chartTab: 'views',
			date: '2026-09-07',
			period: 'day',
			quantity: 1,
			siteId: 1,
			statFields: [ 'views', 'visitors', 'likes', 'comments' ],
		};
		const { container } = render(
			<Provider store={ store }>
				<StatModuleChartTabs
					activeLegend={ [] }
					activeTab={ { attr: 'views', label: 'Views' } }
					chartTab="views"
					period={ { period: 'day' } }
					queryDate={ query.date }
					customQuantity={ 1 }
					customRange={ { chartStart: query.date, chartEnd: query.date, daysInRange: 1 } }
					onChangeLegend={ vi.fn() }
				/>
			</Provider>
		);
		expect( container.querySelector( '.stats-module__placeholder' ) ).toBeInTheDocument();
		const action = requestChartCounts( query );
		const [ current ] = fetch( action );
		act( () => store.dispatch( onError( current.onFailure ) ) );
		expect(
			screen.getByText( "Some stats didn't load in time. Please try again later." )
		).toBeInTheDocument();
		expect( container.querySelector( '.stats-module__placeholder' ) ).not.toBeInTheDocument();
		expect( screen.queryByTestId( 'traffic-chart' ) ).not.toBeInTheDocument();

		act( () => store.dispatch( action ) );
		expect(
			screen.queryByText( "Some stats didn't load in time. Please try again later." )
		).not.toBeInTheDocument();
		expect( container.querySelector( '.stats-module__placeholder' ) ).toBeInTheDocument();
		act( () =>
			store.dispatch(
				onSuccess( current.onSuccess, [ { period: query.date, views: 3, visitors: 2 } ] )
			)
		);
		expect( screen.getByTestId( 'traffic-chart' ) ).toHaveTextContent( '3 views' );
		expect( container.querySelector( '.stats-module__placeholder' ) ).not.toBeInTheDocument();
	} );
} );
