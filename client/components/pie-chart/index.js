/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { pie as d3Pie, arc as d3Arc } from 'd3-shape';

/**
 * Internal dependencies
 */
import DataType from './data/type';
import { sortDataAndAssignSections, isDataEqual } from './data';

const SVG_SIZE = 300;

class PieChart extends Component {
	static propTypes = {
		data: PropTypes.arrayOf( DataType ).isRequired,
		title: PropTypes.string,
		legendBelowChart: PropTypes.boolean,
	};

	static defaultProps = {
		legendBelowChart: true,
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

		const arcs = d3Pie()
			.startAngle( Math.PI )
			.startAngle( -Math.PI )
			.value( datum => datum.value )( sortedData );

		const arcGen = d3Arc()
			.innerRadius( 0 )
			.outerRadius( SVG_SIZE / 2 );

		const paths = arcs.map( arc => arcGen( arc ) );

		return {
			data: sortedData.map( ( datum, index ) => ( {
				...datum,
				path: paths[ index ],
			} ) ),
		};
	}

	render() {
		const { title } = this.props;
		const { data } = this.state;

		return (
			<div className={ 'pie-chart' }>
				<svg
					className={ 'pie-chart__chart-drawing' }
					viewBox={ `0 0 ${ SVG_SIZE } ${ SVG_SIZE }` }
					preserveAspectRatio={ 'xMidYMid meet' }
				>
					<g transform={ `translate(${ SVG_SIZE / 2 }, ${ SVG_SIZE / 2 })` }>
						{ data.map( ( datum, index ) => {
							return (
								<path
									className={ `pie-chart__chart-section-${ datum.sectionNum }` }
									key={ index.toString() }
									d={ datum.path }
								/>
							);
						} ) }
					</g>
				</svg>
				{ title && <h2 className={ 'pie-chart__title' }>{ title }</h2> }
			</div>
		);
	}
}

export default PieChart;
