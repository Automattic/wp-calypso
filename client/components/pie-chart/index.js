/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { pie as d3Pie, arc as d3Arc } from 'd3-shape';

/**
 * Internal dependencies
 */
import LegendItem from './legend-item';

const NUM_COLOR_SECTIONS = 3;
const SVG_SIZE = 300;

class PieChart extends Component {
	static propTypes = {
		data: PropTypes.array.isRequired,
		plural: PropTypes.string,
	};

	drawChart() {
		const { data } = this.props;

		const arcs = d3Pie().value( d => d.value )( data );
		const arcGen = d3Arc()
			.innerRadius( 0 )
			.outerRadius( SVG_SIZE / 2 );

		const paths = arcs.map( arc => arcGen( arc ) );

		let sectionNum = -1;

		return (
			<g transform={ `translate(${ SVG_SIZE / 2 }, ${ SVG_SIZE / 2 })` }>
				{ paths.map( ( path, index ) => {
					sectionNum = ( sectionNum + 1 ) % NUM_COLOR_SECTIONS;
					return (
						<path
							className={ `pie-chart__chart-section-${ sectionNum }` }
							key={ index.toString() }
							d={ path }
						/>
					);
				} ) }
			</g>
		);
	}

	render() {
		const { data, plural } = this.props;
		const dataTotal = data.reduce( ( pv, cv ) => pv + cv.value, 0 );
		return (
			<div>
				<div className={ 'pie-chart__chart' }>
					<svg
						className={ 'pie-chart__chart-drawing' }
						viewBox={ `0 0 ${ SVG_SIZE } ${ SVG_SIZE }` }
						preserveAspectRatio={ 'xMidYMid meet' }
					>
						{ this.drawChart() }
					</svg>
				</div>
				<h2 className={ 'pie-chart__title' }>{ `${ dataTotal } Total ${
					plural ? plural : ''
				}` }</h2>
				<div className={ 'pie-chart__legend' }>
					{ data.map( ( datum, index ) => {
						const sectionNumber = index % NUM_COLOR_SECTIONS;
						return (
							<LegendItem
								key={ index.toString() }
								name={ datum.name }
								value={ datum.value }
								sectionNumber={ sectionNumber }
								percent={ parseFloat( datum.value / dataTotal * 100 ).toFixed( 2 ) }
								description={ datum.description }
							/>
						);
					} ) }
				</div>
			</div>
		);
	}
}

export default localize( PieChart );
