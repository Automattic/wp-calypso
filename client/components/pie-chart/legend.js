/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { isEqual, sortBy } from 'lodash';

/**
 * Internal dependencies
 */
import DataType from './data-type';
import LegendItem from './legend-item';

const NUM_COLOR_SECTIONS = 3;

class PieChartLegend extends Component {
	static propTypes = {
		data: PropTypes.arrayOf( DataType ).isRequired,
	};

	state = this.processData( this.props.data );

	componentWillReceiveProps( nextProps ) {
		if ( ! isEqual( this.props.data, nextProps.data ) ) {
			this.setState( this.processData( nextProps.data ) );
		}
	}

	sortDataAndAssignSections( data ) {
		return sortBy( data, datum => datum.value )
			.reverse()
			.map( ( datum, index ) => ( {
				...datum,
				sectionNum: index % NUM_COLOR_SECTIONS,
			} ) );
	}

	processData( data ) {
		const sortedData = this.sortDataAndAssignSections( data );

		return {
			data: sortedData,
			dataTotal: sortedData.reduce( ( total, datum ) => total + datum.value, 0 ),
		};
	}

	render() {
		const { data, dataTotal } = this.state;
		return (
			<div className={ 'pie-chart__legend' }>
				{ data.map( datum => {
					return (
						<LegendItem
							key={ datum.name }
							name={ datum.name }
							value={ datum.value }
							sectionNumber={ datum.sectionNum }
							percent={
								dataTotal > 0 ? Math.round( datum.value / dataTotal * 100 ).toString() : '0'
							}
							description={ datum.description }
						/>
					);
				} ) }
			</div>
		);
	}
}

export default PieChartLegend;
