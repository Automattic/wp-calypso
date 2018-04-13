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
import Chart from 'components/chart';
import SectionHeader from 'components/section-header';
import placeHolderDataFunction from './placeholder-data';

class GoogleMyBusinessStatsChart extends Component {
	static props = {
		title: PropTypes.string.isRequired,
		description: PropTypes.string.isRequired,
		statType: PropTypes.string.isRequired,
	};

	state = {
		interval: 'week',
	};

	shouldComponentUpdate( nextProps, nextState ) {
		return this.state.interval !== nextState.interval;
	}

	transformData( data ) {
		if ( 1 === data.length ) {
			return data[ 0 ].dimensionalValues.map( datum => ( {
				label: datum.time,
				value: datum.value,
			} ) );
		} else if ( 1 < data.length ) {
			return data[ 0 ].dimensionalValues.map( ( datum, index ) => {
				const nestedDatum = data[ 1 ].dimensionalValues[ index ];
				return {
					label: datum.time,
					value: datum.value,
					nestedValue: nestedDatum.value,
				};
			} );
		}
	}

	render() {
		const { title, description, statType } = this.props;
		const { interval } = this.state;
		const data = placeHolderDataFunction( statType, interval );
		return (
			<div>
				<SectionHeader label={ title } />
				<Card>
					<CardHeading tagName={ 'h2' } size={ 16 }>
						{ description }
					</CardHeading>
					<hr className="gmb-stats__metric-hr" />
					<select
						value={ interval }
						onChange={ event => this.setState( { interval: event.target.value } ) }
					>
						<option value="week">{ 'Week' }</option>
						<option value="month">{ 'Month' }</option>
						<option value="quarter">{ 'Quarter' }</option>
					</select>
					<div className="gmb-stats__metric-chart">
						<Chart data={ this.transformData( data ) } />
					</div>
				</Card>
			</div>
		);
	}
}

export default GoogleMyBusinessStatsChart;
