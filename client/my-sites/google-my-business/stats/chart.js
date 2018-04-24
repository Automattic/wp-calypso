/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CardHeading from 'components/card-heading';
import LineChart from 'components/line-chart';
import PieChart from 'components/pie-chart';
import PieChartLegend from 'components/pie-chart/legend';
import SectionHeader from 'components/section-header';
import {
	changeGoogleMyBusinessStatsInterval,
	requestGoogleMyBusinessStats,
} from 'state/google-my-business/actions';
import { getGoogleMyBusinessStats } from 'state/selectors';
import { getInterval } from 'state/google-my-business/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

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

	onIntervalChange = event =>
		this.props.changeGoogleMyBusinessStatsInterval(
			this.props.siteId,
			this.props.statType,
			event.target.value
		);

	render() {
		const { chartTitle, chartType, description, interval, title } = this.props;
		const { transformedData } = this.state;

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

					<select value={ interval } onChange={ this.onIntervalChange }>
						<option value="week">{ 'Week' }</option>
						<option value="month">{ 'Month' }</option>
						<option value="quarter">{ 'Quarter' }</option>
					</select>

					<div className="gmb-stats__metric-chart">
						{ chartType === 'pie' ? (
							<div>
								<PieChart data={ transformedData } title={ chartTitle } />
								<PieChartLegend data={ transformedData } />
							</div>
						) : (
							<LineChart
								fillArea
								data={ transformedData }
								renderTooltipForDatanum={ this.props.renderTooltipForDatanum }
							/>
						) }
					</div>
				</Card>
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const siteId = getSelectedSiteId( state );
		const interval = getInterval( state, siteId, ownProps.statType );

		return {
			siteId,
			interval,
			data: getGoogleMyBusinessStats( state, siteId, ownProps.statType, interval, getAggregation( ownProps ) ),
		};
	},
	{
		changeGoogleMyBusinessStatsInterval,
		requestGoogleMyBusinessStats,
	}
)( GoogleMyBusinessStatsChart );
