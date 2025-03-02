import { eye } from '@automattic/components/src/icons';
import { Icon, people } from '@wordpress/icons';
import clsx from 'clsx';
import { localize, translate } from 'i18n-calypso';
import { flowRight } from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Component, useRef } from 'react';
import { connect } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import Chart from 'calypso/components/chart';
import { DEFAULT_HEARTBEAT } from 'calypso/components/data/query-site-stats/constants';
import memoizeLast from 'calypso/lib/memoize-last';
import { withPerformanceTrackerStop } from 'calypso/lib/performance-tracking';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { requestChartCounts } from 'calypso/state/stats/chart-tabs/actions';
import { QUERY_FIELDS } from 'calypso/state/stats/chart-tabs/constants';
import { getCountRecords, getLoadingTabs } from 'calypso/state/stats/chart-tabs/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useCssVariable from '../hooks/use-css-variable';
import StatsEmptyState from '../stats-empty-state';
import StatsModulePlaceholder from '../stats-module/placeholder';
import StatTabs from '../stats-tabs';
import { parseLocalDate } from '../utils';
import ChartHeader from './chart-header';
import { buildChartData, getQueryDate } from './utility';

import './style.scss';

const ChartTabShape = PropTypes.shape( {
	attr: PropTypes.string,
	gridicon: PropTypes.string,
	label: PropTypes.string,
	legendOptions: PropTypes.arrayOf( PropTypes.string ),
} );

// data validation for line chart
const transformChartDataToLineFormat = ( chartData, primaryColor, secondaryColor ) => {
	if ( ! Array.isArray( chartData ) ) {
		return [];
	}

	// Create the first data series for views
	const viewsSeries = {
		label: translate( 'Views' ),
		options: { stroke: primaryColor },
		icon: <Icon className="gridicon" icon={ eye } />,
		data: chartData
			.map( ( record ) => {
				const date = parseLocalDate( record.data.period );
				const value = record.data.views;
				if ( isNaN( date.getTime() ) || typeof value !== 'number' ) {
					return null;
				}
				return { date, value };
			} )
			.filter( Boolean ),
	};

	// Create the second data series for visitors
	const visitorsSeries = {
		label: translate( 'Visitors' ),
		options: {
			stroke: secondaryColor,
		},
		icon: <Icon className="gridicon" icon={ people } />,
		data: chartData
			.map( ( record ) => {
				const date = parseLocalDate( record.data.period );
				const value = record.data.visitors;
				if ( isNaN( date.getTime() ) || typeof value !== 'number' ) {
					return null;
				}
				return { date, value };
			} )
			.filter( Boolean ),
	};

	// Return both series
	return [ viewsSeries, visitorsSeries ];
};

class StatModuleChartTabs extends Component {
	static propTypes = {
		slug: PropTypes.string,
		queryParams: PropTypes.object,
		activeLegend: PropTypes.arrayOf( PropTypes.string ),
		activeTab: ChartTabShape,
		availableLegend: PropTypes.arrayOf( PropTypes.string ),
		charts: PropTypes.arrayOf( ChartTabShape ),
		className: PropTypes.string,
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
		chartContainerRef: PropTypes.object,
		primaryColor: PropTypes.string,
		secondaryColor: PropTypes.string,
	};

	state = {
		chartType: 'bar',
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

	makeQuery = () => {
		this.props.requestChartCounts( this.props.query );
		this.props.queryComp && this.props.requestChartCounts( this.props.queryComp );
		this.props.queryDay && this.props.requestChartCounts( this.props.queryDay );
		this.props.queryDayComp && this.props.requestChartCounts( this.props.queryDayComp );
	};

	handleChartTypeChange = ( newType ) => {
		this.setState( { chartType: newType } );
	};

	render() {
		const {
			siteId,
			slug,
			queryParams,
			selectedPeriod,
			isActiveTabLoading,
			className,
			countsComp,
			primaryColor,
			secondaryColor,
			chartContainerRef,
		} = this.props;
		const { chartType } = this.state;

		const chartData = this.props.chartData.map( ( record ) => {
			record.className = record.className?.replaceAll( 'is-selected', '' );
			return record;
		} );

		const classes = [
			'is-chart-tabs',
			className,
			{
				'is-loading': isActiveTabLoading,
				'has-less-than-three-bars': this.props.chartData.length < 3,
			},
		];
		/* pass bars count as `key` to disable transitions between tabs with different column count */
		return (
			<div className={ clsx( ...classes ) } ref={ chartContainerRef }>
				<ChartHeader
					activeLegend={ this.props.activeLegend }
					activeTab={ this.props.activeTab }
					availableLegend={ this.props.availableLegend }
					onLegendClick={ this.onLegendClick }
					charts={ this.props.charts }
					siteId={ siteId }
					slug={ slug }
					period={ selectedPeriod }
					queryParams={ queryParams }
					chartType={ chartType }
					onChartTypeChange={ this.handleChartTypeChange }
				/>

				<StatsModulePlaceholder className="is-chart" isLoading={ isActiveTabLoading } />

				{ chartType === 'bar' ? (
					<Chart barClick={ this.props.barClick } data={ chartData } minBarWidth={ 35 }>
						<StatsEmptyState
							headingText={
								selectedPeriod === 'hour' ? translate( 'No hourly data available' ) : null
							}
							infoText={
								selectedPeriod === 'hour'
									? translate( 'Try selecting a different time frame.' )
									: null
							}
						/>
					</Chart>
				) : (
					<AsyncLoad
						require="calypso/my-sites/stats/components/line-chart"
						className="stats-chart-tabs__line-chart"
						chartData={ transformChartDataToLineFormat( chartData, primaryColor, secondaryColor ) }
						height={ 200 }
						moment={ moment }
					/>
				) }

				<StatTabs
					data={ this.props.counts }
					previousData={ countsComp }
					tabCountsAlt={ this.props.tabCountsAlt }
					tabCountsAltComp={ this.props.tabCountsAltComp }
					tabs={ this.props.charts }
					switchTab={ this.props.switchTab }
					selectedTab={ this.props.chartTab }
					activeIndex={ this.props.queryDate }
					activeKey="period"
					aggregate
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

const memoizedQuery = memoizeLast(
	( chartTab, date, period, quantity, siteId, chartStart = '' ) => ( {
		chartTab,
		date,
		chartStart,
		period,
		quantity,
		siteId,
		statFields: QUERY_FIELDS,
	} )
);

const connectComponent = connect(
	(
		state,
		{ activeLegend, period: { period }, chartTab, queryDate, customQuantity, customRange }
	) => {
		const siteId = getSelectedSiteId( state );
		if ( ! siteId ) {
			return NO_SITE_STATE;
		}

		// Set up quantity for API call.
		const defaultQuantity = 'year' === period ? 10 : 30;
		const quantity = customQuantity ? customQuantity : defaultQuantity;
		const timezoneOffset = getSiteOption( state, siteId, 'gmt_offset' ) || 0;

		// If not provided we compute the value. (maintains previous behaviour)
		const date = customRange
			? customRange.chartEnd
			: getQueryDate( queryDate, timezoneOffset, period, quantity );
		const chartStart = customRange?.chartStart || '';

		const queryKey = `${ date }-${ period }-${ quantity }-${ siteId }`;
		const query = memoizedQuery( chartTab, date, period, quantity, siteId, chartStart );

		let countsComp = null;
		let queryComp = null;
		if ( customRange ) {
			const dateComp = moment( date )
				.subtract( customRange.daysInRange, 'day' )
				.format( 'YYYY-MM-DD' );
			const chartStartComp = moment( chartStart )
				.subtract( customRange.daysInRange, 'day' )
				.format( 'YYYY-MM-DD' );
			queryComp = memoizedQuery( chartTab, dateComp, period, quantity, siteId, chartStartComp );
			countsComp = getCountRecords(
				state,
				siteId,
				queryComp.date,
				queryComp.period,
				queryComp.quantity
			);
		}

		// Query single day stats for the display of visitors, likes, and comments, as we don't have hourly data for them at the moment.
		let queryDay = null;
		let tabCountsAlt = null;
		if ( period === 'hour' && date === chartStart ) {
			queryDay = {
				...query,
				period: 'day',
				quantity: 1,
				statFields: [ 'visitors', 'likes', 'comments' ],
			};
			tabCountsAlt = getCountRecords(
				state,
				siteId,
				queryDay.date,
				queryDay.period,
				queryDay.quantity
			);
		}

		// Query single day stats for the display of visitors, likes, and comments, as we don't have hourly data for them at the moment.
		let queryDayComp = null;
		let tabCountsAltComp = null;
		if ( period === 'hour' && date === chartStart ) {
			const previousDate = moment( date ).subtract( 1, 'day' ).format( 'YYYY-MM-DD' );
			queryDayComp = {
				...query,
				date: previousDate,
				period: 'day',
				quantity: 1,
				statFields: [ 'visitors', 'likes', 'comments' ],
			};
			tabCountsAltComp = getCountRecords(
				state,
				siteId,
				queryDayComp.date,
				queryDayComp.period,
				queryDayComp.quantity
			);
		}

		const counts = getCountRecords( state, siteId, query.date, query.period, query.quantity );
		const chartData = buildChartData(
			activeLegend,
			chartTab,
			counts,
			period,
			queryDate,
			customRange
		);
		const loadingTabs = getLoadingTabs( state, siteId, query.date, query.period, query.quantity );
		const isActiveTabLoading = loadingTabs.includes( chartTab ) || chartData.length < quantity;

		return {
			chartData,
			counts,
			countsComp,
			isActiveTabLoading,
			query,
			queryComp,
			queryKey,
			siteId,
			selectedPeriod: period,
			queryDay,
			tabCountsAlt: tabCountsAlt?.[ 0 ],
			queryDayComp,
			tabCountsAltComp: tabCountsAltComp?.[ 0 ],
		};
	},
	{ recordGoogleEvent, requestChartCounts }
);

// TODO: let's convert it to a function component and remove all the hassle.
const withCssColors = ( WrappedComponent ) => ( props ) => {
	const chartContainerRef = useRef( null );

	const primaryColor = useCssVariable( '--color-primary-light', chartContainerRef.current );
	const secondaryColor = useCssVariable( '--color-primary-dark', chartContainerRef.current );

	return (
		<WrappedComponent
			{ ...props }
			primaryColor={ primaryColor }
			secondaryColor={ secondaryColor }
			chartContainerRef={ chartContainerRef }
		/>
	);
};

export default flowRight(
	localize,
	connectComponent
)( withPerformanceTrackerStop( withCssColors( StatModuleChartTabs ) ) );
