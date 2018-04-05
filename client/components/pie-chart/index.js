/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { pie as d3Pie, arc as d3Arc } from 'd3-shape';
import { isEqual, sortBy } from 'lodash';

/**
 * Internal dependencies
 */
import LegendItem from './legend-item';

const NUM_COLOR_SECTIONS = 3;
const SVG_SIZE = 300;

class PieChart extends Component {
	static propTypes = {
		data: PropTypes.arrayOf(
			PropTypes.shape( {
				description: PropTypes.string,
				name: PropTypes.string.isRequired,
				value: PropTypes.number.isRequired,
			} )
		).isRequired,
		title: PropTypes.string,
	};

	constructor( props ) {
		super( props );

		this.state = this.processData( props.data );
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! isEqual( this.props.data, nextProps.data ) ) {
			this.setState( this.processData( nextProps.data ) );
		}
	}

	processData( data ) {
		const sortedData = sortBy( data, datum => datum.value ).reverse();

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
				sectionNum: index % NUM_COLOR_SECTIONS,
				path: paths[ index ],
			} ) ),
			dataTotal: sortedData.reduce( ( result, datum ) => result + datum.value, 0 ),
		};
	}

	render() {
		const { title } = this.props;
		const { data, dataTotal } = this.state;

		return (
			<div>
				<div className={ 'pie-chart__chart' }>
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
				</div>

				{ title && <h2 className={ 'pie-chart__title' }>{ title }</h2> }

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
			</div>
		);
	}
}

export default PieChart;
