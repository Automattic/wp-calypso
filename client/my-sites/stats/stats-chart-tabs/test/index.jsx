/**
 * @jest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { fetch, onError, onSuccess } from 'calypso/state/data-layer/wpcom/sites/stats/visits';
import { requestChartCounts } from 'calypso/state/stats/chart-tabs/actions';
import chartTabsReducer from 'calypso/state/stats/chart-tabs/reducer';
import StatModuleChartTabs from '../';

jest.mock( '@automattic/viewport-react', () => ( {
	withMobileBreakpoint: ( component ) => component,
} ) );
jest.mock( 'calypso/lib/performance-tracking', () => ( {
	withPerformanceTrackerStop: ( component ) => component,
} ) );
jest.mock( 'calypso/state/ui/selectors', () => ( { getSelectedSiteId: () => 1 } ) );
jest.mock( 'calypso/state/sites/selectors', () => ( { getSiteOption: () => 0 } ) );
jest.mock( '../../stats-tabs', () => () => null );
jest.mock( '../chart-header', () => () => null );
jest.mock( 'calypso/components/chart', () => ( { data } ) => (
	<div data-testid="traffic-chart">{ data[ 0 ]?.value } views</div>
) );

describe( 'Stats chart request recovery', () => {
	beforeEach( () => jest.useFakeTimers() );
	afterEach( () => {
		jest.clearAllTimers();
		jest.useRealTimers();
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
					onChangeLegend={ jest.fn() }
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
