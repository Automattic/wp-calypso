import { select as d3Select, mouse as d3Mouse } from 'd3-selection';
import { pie as d3Pie, arc as d3Arc } from 'd3-shape';
import { localize } from 'i18n-calypso';
import { throttle, sortBy } from 'lodash';
import PropTypes from 'prop-types';
import { Component, createRef } from 'react';
import DataType from './data-type';

import './style.scss';

const SVG_SIZE = 300;
const NUM_COLOR_SECTIONS = 3;

function transformData( data, { donut = false, startAngle = -Math.PI } ) {
	const sortedData = sortBy( data, ( datum ) => datum.value )
		.reverse()
		.map( ( datum, index ) => ( {
			...datum,
			sectionNum: index % NUM_COLOR_SECTIONS,
		} ) );

	const arcs = d3Pie()
		.startAngle( startAngle )
		.value( ( datum ) => datum.value )( sortedData );

	const arcGen = d3Arc()
		.innerRadius( donut ? SVG_SIZE / 4 : 0 )
		.outerRadius( SVG_SIZE / 2 );

	const paths = arcs.map( ( arc ) => arcGen( arc ) );

	return sortedData.map( ( datum, index ) => ( {
		...datum,
		path: paths[ index ],
	} ) );
}

class PieChart extends Component {
	static propTypes = {
		data: PropTypes.arrayOf( DataType ).isRequired,
		donut: PropTypes.bool,
		startAngle: PropTypes.number,
		translate: PropTypes.func.isRequired,
		title: PropTypes.oneOfType( [ PropTypes.string, PropTypes.func ] ),
		hasTooltip: PropTypes.bool,
	};

	state = {
		data: null,
		dataTotal: 0,
	};

	chartRef = createRef();

	// Listen to mousemove and mouseleave events on the chart to operate the tooltip.
	bindEvents = ( svg, data ) => {
		const dataTotal = this.state.dataTotal;
		const tooltip = d3Select( '.pie-chart__tooltip' );

		const updateTooltipWhenMouseMove = throttle(
			( coordinates, current ) => {
				const percent =
					dataTotal > 0 ? Math.round( ( current.value / dataTotal ) * 100 ).toString() : '0';

				tooltip.style( 'left', coordinates[ 0 ] + 150 - 205 + 'px' );
				tooltip.style( 'top', coordinates[ 1 ] + 150 + 10 + 'px' );
				tooltip.style( 'visibility', 'visible' );
				tooltip.html(
					`${ current.icon }<div class="pie-chart__tooltip-content"><div>${ current.name }</div><div>${ percent }%</div></div>`
				);
			},
			50,
			{
				leading: true,
				trailing: false,
			}
		);

		svg.selectAll( 'path' ).on( 'mousemove', function () {
			const coordinates = d3Mouse( this );
			const current = data.find( ( datum ) => {
				return datum.className === d3Select( this ).attr( 'data-key' );
			} );

			updateTooltipWhenMouseMove( coordinates, current );
		} );

		svg.selectAll( 'path' ).on( 'mouseleave', () => {
			tooltip.style( 'visibility', 'hidden' );
		} );
	};

	static getDerivedStateFromProps( nextProps, prevState ) {
		if ( nextProps.data !== prevState.data ) {
			return {
				data: nextProps.data,
				dataTotal: nextProps.data.reduce( ( sum, { value } ) => sum + value, 0 ),
				transformedData: transformData( nextProps.data, {
					donut: nextProps.donut,
					startAngle: nextProps.startAngle,
				} ),
			};
		}

		return null;
	}

	renderPieChart() {
		const { transformedData } = this.state;

		return transformedData.map( ( datum ) => {
			return (
				<path
					className={ `pie-chart__chart-section-${ datum.sectionNum } pie-chart__chart-section-${ datum.className }` }
					key={ datum.name }
					d={ datum.path }
					data-key={ datum.className }
				/>
			);
		} );
	}

	renderEmptyChart() {
		return (
			<circle cx={ 0 } cy={ 0 } r={ SVG_SIZE / 2 } className="pie-chart__chart-drawing-empty" />
		);
	}

	componentDidMount() {
		if ( this.props.hasTooltip ) {
			this.bindEvents( d3Select( this.chartRef.current ), this.state.data );
		}
	}

	render() {
		const { title, translate, hasTooltip } = this.props;
		const { dataTotal } = this.state;

		return (
			<div className="pie-chart">
				{ hasTooltip ? (
					<div className="pie-chart__chart-container">
						<div className="pie-chart__tooltip"></div>

						<svg
							ref={ this.chartRef }
							className="pie-chart__chart-drawing"
							viewBox={ `0 0 ${ SVG_SIZE } ${ SVG_SIZE }` }
							preserveAspectRatio="xMidYMid meet"
						>
							<g transform={ `translate(${ SVG_SIZE / 2 }, ${ SVG_SIZE / 2 })` }>
								{ dataTotal > 0 ? this.renderPieChart() : this.renderEmptyChart() }
							</g>
						</svg>
					</div>
				) : (
					<svg
						className="pie-chart__chart-drawing"
						viewBox={ `0 0 ${ SVG_SIZE } ${ SVG_SIZE }` }
						preserveAspectRatio="xMidYMid meet"
					>
						<g transform={ `translate(${ SVG_SIZE / 2 }, ${ SVG_SIZE / 2 })` }>
							{ dataTotal > 0 ? this.renderPieChart() : this.renderEmptyChart() }
						</g>
					</svg>
				) }

				{ title && (
					<h2 className="pie-chart__title">
						{ 'string' === typeof title ? title : title( translate, dataTotal ) }
					</h2>
				) }
			</div>
		);
	}
}

export default localize( PieChart );
