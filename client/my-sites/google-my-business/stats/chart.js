/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CardHeading from 'components/card-heading';
import PieChart from 'components/pie-chart';
import PieChartLegend from 'components/pie-chart/legend';
import SectionHeader from 'components/section-header';
import placeHolderDataFunction from './placeholder-data';

class GoogleMyBusinessStatsChart extends Component {
	static props = {
		description: PropTypes.string,
		statType: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
		dataSeriesInfo: PropTypes.object,
		chartTitle: PropTypes.oneOfType( [ PropTypes.func, PropTypes.string ] ),
	};

	static defaultProps = {
		dataSeriesInfo: {},
	};

	state = {
		interval: 'week',
	};

	shouldComponentUpdate( nextProps, nextState ) {
		return this.state.interval !== nextState.interval;
	}

	transformData( data ) {
		return data.map( value => {
			return {
				value: value.dimensionalValues.value,
				description:
					this.props.dataSeriesInfo[ value.metric ] !== undefined
						? this.props.dataSeriesInfo[ value.metric ].description
						: '',
				name:
					this.props.dataSeriesInfo[ value.metric ] !== undefined
						? this.props.dataSeriesInfo[ value.metric ].name
						: value.metric,
			};
		} );
	}

	render() {
		const { chartTitle, description, statType, title } = this.props;
		const { interval } = this.state;
		const data = placeHolderDataFunction( statType, interval );
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
					<select
						value={ interval }
						onChange={ event => this.setState( { interval: event.target.value } ) }
					>
						<option value="week">{ 'Week' }</option>
						<option value="month">{ 'Month' }</option>
						<option value="quarter">{ 'Quarter' }</option>
					</select>
					<div className="gmb-stats__metric-chart">
						<PieChart data={ this.transformData( data ) } title={ chartTitle } />
						<PieChartLegend data={ this.transformData( data ) } />
					</div>
				</Card>
			</div>
		);
	}
}

export default GoogleMyBusinessStatsChart;
