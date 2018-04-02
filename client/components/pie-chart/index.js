/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { pie as d3Pie, arc as d3Arc } from 'd3-shape';
import { assign, isEqual } from 'lodash';

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
		const arcs = d3Pie()
			.startAngle( Math.PI )
			.startAngle( -Math.PI )
			.value( d => d.value )( data );
		const arcGen = d3Arc()
			.innerRadius( 0 )
			.outerRadius( SVG_SIZE / 2 );

		const paths = arcs.map( arc => arcGen( arc ) );

		return {
			data: data.map( ( datum, index ) =>
				assign( {}, datum, { sectionNum: index % NUM_COLOR_SECTIONS, path: paths[ index ] } )
			),
			dataTotal: data.reduce( ( pv, cv ) => pv + cv.value, 0 ),
		};
	}

	render() {
		const { plural } = this.props;
		const { dataTotal, data } = this.state;

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
				<h2 className={ 'pie-chart__title' }>{ `${ dataTotal } ${ plural ? plural : '' }` }</h2>
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

export default localize( PieChart );
