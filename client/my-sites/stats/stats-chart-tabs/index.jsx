import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import Chart from 'calypso/components/chart';
import Legend from 'calypso/components/chart/legend';
import { DEFAULT_HEARTBEAT } from 'calypso/components/data/query-site-stats/constants';
import memoizeLast from 'calypso/lib/memoize-last';
import { withPerformanceTrackerStop } from 'calypso/lib/performance-tracking';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { requestChartCounts } from 'calypso/state/stats/chart-tabs/actions';
import { QUERY_FIELDS } from 'calypso/state/stats/chart-tabs/constants';
import { getCountRecords, getLoadingTabs } from 'calypso/state/stats/chart-tabs/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import StatsEmptyState from '../stats-empty-state';
import StatsModulePlaceholder from '../stats-module/placeholder';
import StatTabs from '../stats-tabs';
import { buildChartData, getQueryDate } from './utility';

import './style.scss';

const ChartTabShape = PropTypes.shape( {
	attr: PropTypes.string,
	gridicon: PropTypes.string,
	label: PropTypes.string,
	legendOptions: PropTypes.arrayOf( PropTypes.string ),
} );

class StatModuleChartTabs extends Component {
	static propTypes = {
		activeLegend: PropTypes.arrayOf( PropTypes.string ),
		activeTab: ChartTabShape,
		availableLegend: PropTypes.arrayOf( PropTypes.string ),
		charts: PropTypes.arrayOf( ChartTabShape ),
		counts: PropTypes.arrayOf(
			PropTypes.shape( {
				comments: PropTypes.number,
				labelDay: PropTypes.string,
				likes: PropTypes.number,
				period: PropTypes.string,
				posts: PropTypes.number,
				visitors: PropTypes.number,
				views: PropTypes.number,
			} )
		),
		isActiveTabLoading: PropTypes.bool,
		onChangeLegend: PropTypes.func.isRequired,
	};

	intervalId = null;

	componentDidMount() {
		if ( this.props.query ) {
			this.startQueryInterval();
		}
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.query && prevProps.queryKey !== this.props.queryKey ) {
			this.startQueryInterval();
		}
	}

	onLegendClick = ( chartItem ) => {
		const activeLegend = this.props.activeLegend.slice();
		const chartIndex = activeLegend.indexOf( chartItem );
		let gaEventAction;
		if ( -1 === chartIndex ) {
			activeLegend.push( chartItem );
			gaEventAction = ' on';
		} else {
			activeLegend.splice( chartIndex );
			gaEventAction = ' off';
		}
		this.props.recordGoogleEvent(
			'Stats',
			`Toggled Nested Chart ${ chartItem } ${ gaEventAction }`
		);
		this.props.onChangeLegend( activeLegend );
	};

	startQueryInterval() {
		// NOTE: Unpredictable behavior will arise if DEFAULT_HEARTBEAT < request duration!
		Number.isFinite( this.intervalId ) && clearInterval( this.intervalId );
		this.makeQuery();
		this.intervalId = setInterval( this.makeQuery, DEFAULT_HEARTBEAT );
	}

	makeQuery = () => this.props.requestChartCounts( this.props.query );

	render() {
		const { isActiveTabLoading } = this.props;
		const classes = [
			'is-chart-tabs',
			{
				'is-loading': isActiveTabLoading,
			},
		];

		/* pass bars count as `key` to disable transitions between tabs with different column count */
		return (
			<div className={ classNames( ...classes ) }>
				<Legend
					activeCharts={ this.props.activeLegend }
					activeTab={ this.props.activeTab }
					availableCharts={ this.props.availableLegend }
					clickHandler={ this.onLegendClick }
					tabs={ this.props.charts }
				/>
				{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
				<StatsModulePlaceholder className="is-chart" isLoading={ isActiveTabLoading } />
				<Chart barClick={ this.props.barClick } data={ this.props.chartData } minBarWidth={ 35 }>
					<StatsEmptyState stateType={ this.props.activeTab && this.props.activeTab.label } />
				</Chart>
				<StatTabs
					data={ this.props.counts }
					tabs={ this.props.charts }
					switchTab={ this.props.switchTab }
					selectedTab={ this.props.chartTab }
					activeIndex={ this.props.queryDate }
					activeKey="period"
				/>
			</div>
		);
	}
}

const NO_SITE_STATE = {
	siteId: null,
	counts: [],
	chartData: [],
};

const memoizedQuery = memoizeLast( ( chartTab, date, period, quantity, siteId ) => ( {
	chartTab,
	date,
	period,
	quantity,
	siteId,
	statFields: QUERY_FIELDS,
} ) );

const connectComponent = connect(
	( state, { activeLegend, period: { period }, chartTab, queryDate } ) => {
		const siteId = getSelectedSiteId( state );
		if ( ! siteId ) {
			return NO_SITE_STATE;
		}

		const quantity = 'year' === period ? 10 : 30;
		const counts = getCountRecords( state, siteId, period );
		const chartData = buildChartData( activeLegend, chartTab, counts, period, queryDate );
		const loadingTabs = getLoadingTabs( state, siteId, period );
		const isActiveTabLoading = loadingTabs.includes( chartTab ) || chartData.length !== quantity;
		const timezoneOffset = getSiteOption( state, siteId, 'gmt_offset' ) || 0;
		const date = getQueryDate( queryDate, timezoneOffset, period, quantity );
		const queryKey = `${ date }-${ period }-${ quantity }-${ siteId }`;
		const query = memoizedQuery( chartTab, date, period, quantity, siteId );

		return {
			chartData,
			counts,
			isActiveTabLoading,
			query,
			queryKey,
			siteId,
		};
	},
	{ recordGoogleEvent, requestChartCounts }
);

export default flowRight(
	localize,
	connectComponent
)( withPerformanceTrackerStop( StatModuleChartTabs ) );
