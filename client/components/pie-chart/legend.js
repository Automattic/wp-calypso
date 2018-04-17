/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import DataType from './data/type';
import LegendItem from './legend-item';
import { sortDataAndAssignSections, isDataEqual } from './data';

class PieChartLegend extends Component {
	static propTypes = {
		data: PropTypes.arrayOf( DataType ).isRequired,
	};

	constructor( props ) {
		super( props );

		this.state = this.processData( props.data );
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! isDataEqual( this.props.data, nextProps.data ) ) {
			this.setState( this.processData( nextProps.data ) );
		}
	}

	processData( data ) {
		const sortedData = sortDataAndAssignSections( data );

		return {
			data: sortedData,
			dataTotal: sortedData.reduce( ( total, datum ) => total + datum.value, 0 ),
		};
	}

	render() {
		const { data, dataTotal } = this.state;
		return (
			<div className={ 'pie-chart__legend' }>
				{ data.map( ( datum, index ) => {
					return (
						<LegendItem
							key={ index.toString() }
							name={ datum.name }
							value={ datum.value }
							sectionNumber={ datum.sectionNum }
							percent={ Math.round( datum.value / dataTotal * 100 ).toString() }
							description={ datum.description }
						/>
					);
				} ) }
			</div>
		);
	}
}

export default PieChartLegend;
