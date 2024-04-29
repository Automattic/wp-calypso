import { select as d3Select, mouse as d3Mouse } from 'd3-selection';
import { pie as d3Pie, arc as d3Arc } from 'd3-shape';
import { localize } from 'i18n-calypso';
import { throttle } from 'lodash';
import PropTypes from 'prop-types';
import { Component, createRef } from 'react';
import DataType from './data-type';
import { sortData } from './legend';

import './style.scss';

const SVG_SIZE = 300;

// Bottom left position relative to the cursor for the tooltip,
// which is the tooltip width offset the distance from the right edge to the arrow.
const TOOLTIP_OFFSET_X = -207;
const TOOLTIP_OFFSET_Y = 0;

function transformData( data, { donut = false, startAngle = -Math.PI, svgSize = SVG_SIZE } ) {
	const sortedData = sortData( data );

	const arcs = d3Pie()
		.startAngle( startAngle )
		.value( ( datum ) => datum.value )( sortedData );

	const arcGen = d3Arc()
		.innerRadius( donut ? svgSize / 4 : 0 )
		.outerRadius( svgSize / 2 );

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
		svgSize: PropTypes.number,
	};

	state = {
		data: null,
		dataTotal: 0,
	};

	chartRef = createRef();

	// Listen to mousemove and mouseleave events on the chart to operate the tooltip.
	bindEvents = ( svg, data, svgSize ) => {
		const dataTotal = this.state.dataTotal;
		const tooltip = d3Select( '.pie-chart__tooltip' );

		const updateTooltipWhenMouseMove = throttle(
			( coordinates, current ) => {
				const percent =
					dataTotal > 0 ? Math.round( ( current.value / dataTotal ) * 100 ).toString() : '0';

				tooltip.style( 'left', coordinates[ 0 ] + svgSize / 2 + TOOLTIP_OFFSET_X + 'px' );
				tooltip.style( 'top', coordinates[ 1 ] + svgSize / 2 + TOOLTIP_OFFSET_Y + 'px' );
				tooltip.style( 'visibility', 'visible' );
				tooltip.html(
					`${ current.icon }<div class="pie-chart__tooltip-content"><div>${ current.name }</div><div>${ percent }%</div></div>`
				);
			},
			30,
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
					svgSize: nextProps.svgSize,
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

	renderEmptyChart( svgSize ) {
		return (
			<circle cx={ 0 } cy={ 0 } r={ svgSize / 2 } className="pie-chart__chart-drawing-empty" />
		);
	}

	componentDidMount() {
		if ( this.props.hasTooltip ) {
			this.bindEvents( d3Select( this.chartRef.current ), this.state.data, this.props.svgSize );
		}
	}

	render() {
		const { title, translate, hasTooltip, svgSize } = this.props;
		const { dataTotal } = this.state;

		return (
			<div className="pie-chart">
				{ hasTooltip ? (
					<div className="pie-chart__chart-container">
						<div className="pie-chart__tooltip"></div>

						<svg
							ref={ this.chartRef }
							className="pie-chart__chart-drawing"
							width={ svgSize }
							height={ svgSize }
							viewBox={ `0 0 ${ svgSize } ${ svgSize }` }
							preserveAspectRatio="xMidYMid meet"
						>
							<g transform={ `translate(${ svgSize / 2 }, ${ svgSize / 2 })` }>
								{ dataTotal > 0 ? this.renderPieChart() : this.renderEmptyChart( svgSize ) }
							</g>
						</svg>
					</div>
				) : (
					<svg
						className="pie-chart__chart-drawing"
						viewBox={ `0 0 ${ svgSize } ${ svgSize }` }
						preserveAspectRatio="xMidYMid meet"
					>
						<g transform={ `translate(${ svgSize / 2 }, ${ svgSize / 2 })` }>
							{ dataTotal > 0 ? this.renderPieChart() : this.renderEmptyChart( svgSize ) }
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

PieChart.defaultProps = {
	donut: false,
	startAngle: -Math.PI,
	hasTooltip: false,
	svgSize: SVG_SIZE,
};

export default localize( PieChart );
