/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CardHeading from 'components/card-heading';
import LineChart from 'components/line-chart';
import LineChartPlaceholder from 'components/line-chart/placeholder';
import PieChart from 'components/pie-chart';
import PieChartLegend from 'components/pie-chart/legend';
import PieChartLegendPlaceholder from 'components/pie-chart/legend-placeholder';
import PieChartPlaceholder from 'components/pie-chart/placeholder';
import SectionHeader from 'components/section-header';
import { changeGoogleMyBusinessStatsInterval } from 'state/ui/google-my-business/actions';
import { getGoogleMyBusinessStats } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getStatsInterval } from 'state/ui/google-my-business/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { requestGoogleMyBusinessStats } from 'state/google-my-business/actions';

function transformData( props ) {
	const { data } = props;

	if ( ! data ) {
		return data;
	}

	const aggregation = getAggregation( props );

	if ( aggregation === 'total' ) {
		return data.metricValues.map( metric => ( {
			value: metric.totalValue.value,
			description: get( props.dataSeriesInfo, `${ metric.metric }.description`, '' ),
			name: get( props.dataSeriesInfo, `${ metric.metric }.name`, metric.metric ),
		} ) );
	}

	return data.metricValues.map( metric => {
		return metric.dimensionalValues.map( datum => {
			return {
				date: Date.parse( datum.time ),
				value: datum.value,
			};
		} );
	} );
}

function getAggregation( props ) {
	return props.chartType === 'pie' ? 'total' : 'daily';
}

class GoogleMyBusinessStatsChart extends Component {
	static propTypes = {
		changeGoogleMyBusinessStatsInterval: PropTypes.func.isRequired,
		chartTitle: PropTypes.oneOfType( [ PropTypes.func, PropTypes.string ] ),
		chartType: PropTypes.oneOf( [ 'pie', 'line' ] ),
		data: PropTypes.object,
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

	handleIntervalChange = event => {
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
					<PieChartPlaceholder title={ !! chartTitle } />
					<PieChartLegendPlaceholder numLegendElements={ Object.keys( dataSeriesInfo ).length } />
				</Fragment>
			);
		}

		return (
			<Fragment>
				<PieChart data={ transformedData } title={ chartTitle } />
				<PieChartLegend data={ transformedData } />
			</Fragment>
		);
	}

	renderLineChart() {
		const { renderTooltipForDatanum } = this.props;
		const { transformedData } = this.state;

		if ( ! transformedData ) {
			return <LineChartPlaceholder />;
		}

		return (
			<LineChart
				fillArea
				data={ transformedData }
				renderTooltipForDatanum={ renderTooltipForDatanum }
			/>
		);
	}

	renderChart() {
		const { chartType } = this.props;

		return chartType === 'pie' ? this.renderPieChart() : this.renderLineChart();
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

							<hr className="gmb-stats__metric-hr" />
						</div>
					) }
					<select value={ interval } onChange={ this.handleIntervalChange }>
						<option value="week">{ translate( 'Week' ) }</option>
						<option value="month">{ translate( 'Month' ) }</option>
						<option value="quarter">{ translate( 'Quarter' ) }</option>
					</select>

					<div className="gmb-stats__metric-chart">{ this.renderChart() }</div>
				</Card>
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const siteId = getSelectedSiteId( state );
		const interval = getStatsInterval( state, siteId, ownProps.statType );
		return {
			siteId,
			interval,
			data: getGoogleMyBusinessStats(
				state,
				siteId,
				ownProps.statType,
				interval,
				getAggregation( ownProps )
			),
		};
	},
	{
		changeGoogleMyBusinessStatsInterval,
		recordTracksEvent,
		requestGoogleMyBusinessStats,
	}
)( localize( GoogleMyBusinessStatsChart ) );
