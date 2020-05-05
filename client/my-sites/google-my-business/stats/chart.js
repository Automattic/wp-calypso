/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { flatten, partialRight, sumBy } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import CardHeading from 'components/card-heading';
import getGoogleMyBusinessStats from 'state/selectors/get-google-my-business-stats';
import getGoogleMyBusinessStatsError from 'state/selectors/get-google-my-business-stats-error';
import LineChart from 'components/line-chart';
import LineChartPlaceholder from 'components/line-chart/placeholder';
import Notice from 'components/notice';
import PieChart from 'components/pie-chart';
import PieChartLegend from 'components/pie-chart/legend';
import PieChartLegendPlaceholder from 'components/pie-chart/legend-placeholder';
import PieChartPlaceholder from 'components/pie-chart/placeholder';
import SectionHeader from 'components/section-header';
import { changeGoogleMyBusinessStatsInterval } from 'state/ui/google-my-business/actions';
import { enhanceWithSiteType, recordTracksEvent } from 'state/analytics/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getStatsInterval } from 'state/ui/google-my-business/selectors';
import { requestGoogleMyBusinessStats } from 'state/google-my-business/actions';
import { withEnhancers } from 'state/utils';

const withToolTip = ( WrappedComponent ) => ( props ) => {
	// inject interval props to renderTooltipForDatanum
	const renderTooltipForDatanum = props.renderTooltipForDatanum
		? partialRight( props.renderTooltipForDatanum, props.tooltipInterval )
		: null;

	const newProps = {
		...props,
		renderTooltipForDatanum,
	};

	return <WrappedComponent { ...newProps } />;
};

const LineChartWithTooltip = withToolTip( LineChart );

function transformData( props ) {
	const { data } = props;

	if ( ! data ) {
		return data;
	}

	const aggregation = getAggregation( props );

	if ( aggregation === 'total' ) {
		return data.metricValues.map( ( metric ) => ( {
			value: metric.totalValue.value,
			description: props.dataSeriesInfo?.[ metric.metric ]?.description ?? '',
			name: props.dataSeriesInfo?.[ metric.metric ]?.name ?? metric.metric,
		} ) );
	}

	return data.metricValues.map( ( metric ) => {
		return metric.dimensionalValues.map( ( datum ) => {
			const datumDate = new Date( datum.time );
			/* lock date to midnight for all values to better align with ticks */
			datumDate.setHours( 0 );
			datumDate.setMinutes( 0 );
			datumDate.setSeconds( 0 );
			datumDate.setMilliseconds( 0 );
			return {
				date: datumDate.getTime(),
				value: datum.value || 0,
			};
		} );
	} );
}

function createLegendInfo( props ) {
	const { data } = props;

	if ( ! data ) {
		return data;
	}

	return data.metricValues.map( ( metric ) => ( {
		description: props.dataSeriesInfo?.[ metric.metric ]?.description ?? '',
		name: props.dataSeriesInfo?.[ metric.metric ]?.name ?? metric.metric,
	} ) );
}

function getAggregation( props ) {
	return props.chartType === 'pie' ? 'total' : 'daily';
}

/* eslint-disable wpcalypso/jsx-classname-namespace */
/* eslint-disable jsx-a11y/no-onchange */

class GoogleMyBusinessStatsChart extends Component {
	static propTypes = {
		changeGoogleMyBusinessStatsInterval: PropTypes.func.isRequired,
		chartTitle: PropTypes.oneOfType( [ PropTypes.func, PropTypes.string ] ),
		chartType: PropTypes.oneOf( [ 'pie', 'line' ] ),
		data: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
		dataSeriesInfo: PropTypes.object,
		description: PropTypes.string,
		interval: PropTypes.oneOf( [ 'week', 'month', 'quarter' ] ),
		recordTracksEvent: PropTypes.func.isRequired,
		renderTooltipForDatanum: PropTypes.func,
		requestGoogleMyBusinessStats: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,
		statType: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
	};

	static defaultProps = {
		chartType: 'line',
		dataSeriesInfo: {},
	};

	state = {
		data: null,
	};

	static getDerivedStateFromProps( nextProps, prevState ) {
		if ( nextProps.data !== prevState.data ) {
			return {
				data: nextProps.data,
				transformedData: transformData( nextProps ),
				legendInfo: createLegendInfo( nextProps ),
			};
		}

		return null;
	}

	componentDidMount() {
		if ( this.props.siteId ) {
			this.requestGoogleMyBusinessStats();
		}
	}

	componentDidUpdate( prevProps ) {
		if (
			this.props.chartType !== prevProps.chartType ||
			this.props.interval !== prevProps.interval ||
			this.props.siteId !== prevProps.siteId ||
			this.props.statType !== prevProps.statType
		) {
			this.requestGoogleMyBusinessStats();
		}
	}

	requestGoogleMyBusinessStats() {
		this.props.requestGoogleMyBusinessStats(
			this.props.siteId,
			this.props.statType,
			this.props.interval,
			getAggregation( this.props )
		);
	}

	handleIntervalChange = ( event ) => {
		const { interval, statType, siteId } = this.props;

		this.props.recordTracksEvent( 'calypso_google_my_business_stats_chart_interval_change', {
			previous_interval: interval,
			new_interval: event.target.value,
			stat_type: statType,
		} );

		this.props.changeGoogleMyBusinessStatsInterval( siteId, statType, event.target.value );
	};

	renderPieChart() {
		const { chartTitle, dataSeriesInfo } = this.props;
		const { transformedData } = this.state;

		if ( ! transformedData ) {
			return (
				<Fragment>
					<PieChartPlaceholder title={ chartTitle } />
					<PieChartLegendPlaceholder dataSeriesInfo={ Object.values( dataSeriesInfo ) } />
				</Fragment>
			);
		}

		return (
			<Fragment>
				<div className="gmb-stats__pie-chart">
					<PieChart data={ transformedData } title={ chartTitle } />

					{ this.renderChartNotice() }
				</div>
				<PieChartLegend data={ transformedData } />
			</Fragment>
		);
	}

	renderLineChart() {
		const { renderTooltipForDatanum, interval } = this.props;
		const { transformedData, legendInfo } = this.state;

		if ( ! transformedData ) {
			return <LineChartPlaceholder />;
		}

		return (
			<Fragment>
				<div className="gmb-stats__line-chart">
					<LineChartWithTooltip
						fillArea
						data={ transformedData }
						legendInfo={ legendInfo }
						renderTooltipForDatanum={ renderTooltipForDatanum }
						tooltipInterval={ interval }
					/>

					{ this.renderChartNotice() }
				</div>
			</Fragment>
		);
	}

	renderChart() {
		const { chartType } = this.props;

		return chartType === 'pie' ? this.renderPieChart() : this.renderLineChart();
	}

	isChartEmpty() {
		const { transformedData } = this.state;

		if ( ! transformedData ) {
			return false;
		}

		return sumBy( flatten( transformedData ), 'value' ) === 0;
	}

	renderChartNotice() {
		const { statsError, translate } = this.props;

		const isEmptyChart = this.isChartEmpty();

		if ( ! isEmptyChart && ! statsError ) {
			return;
		}

		let text = translate( 'Error loading data', {
			context: 'Message on a chart in Stats where an error was occured while loading data',
			comment: 'Should be limited to 32 characters to prevent wrapping',
		} );

		let status = 'is-error';

		if ( isEmptyChart ) {
			text = translate( 'No activity this period', {
				context: 'Message on empty bar chart in Stats',
				comment: 'Should be limited to 32 characters to prevent wrapping',
			} );

			status = 'is-warning';
		}

		return (
			<div className="chart__empty">
				<Notice
					className="chart__empty-notice"
					status={ status }
					isCompact
					text={ text }
					showDismiss={ false }
				/>
			</div>
		);
	}

	render() {
		const { description, interval, title, translate } = this.props;

		return (
			<div>
				<SectionHeader label={ title } />

				<Card>
					{ description && (
						<div>
							<CardHeading tagName={ 'h2' } size={ 16 }>
								{ description }
							</CardHeading>
						</div>
					) }
					<select
						className="gmb-stats__chart-interval"
						onChange={ this.handleIntervalChange }
						value={ interval }
					>
						<option value="week">{ translate( 'Week' ) }</option>
						<option value="month">{ translate( 'Month' ) }</option>
						<option value="quarter">{ translate( 'Quarter' ) }</option>
					</select>

					<div className="gmb-stats__chart">{ this.renderChart() }</div>
				</Card>
			</div>
		);
	}
}
/* eslint-enable wpcalypso/jsx-classname-namespace */
/* eslint-enable jsx-a11y/no-onchange */

export default connect(
	( state, ownProps ) => {
		const siteId = getSelectedSiteId( state );
		const interval = getStatsInterval( state, siteId, ownProps.statType );
		const aggregation = getAggregation( ownProps );

		return {
			siteId,
			interval,
			data: getGoogleMyBusinessStats( state, siteId, ownProps.statType, interval, aggregation ),
			statsError: getGoogleMyBusinessStatsError(
				state,
				siteId,
				ownProps.statType,
				interval,
				aggregation
			),
		};
	},
	{
		changeGoogleMyBusinessStatsInterval,
		recordTracksEvent: withEnhancers( recordTracksEvent, enhanceWithSiteType ),
		requestGoogleMyBusinessStats,
	}
)( localize( GoogleMyBusinessStatsChart ) );
