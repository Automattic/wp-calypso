/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { range } from 'lodash';

const SVG_SIZE = 30;

class PieChartLegendPlaceholder extends Component {
	static propTypes = {
		numLegendElements: PropTypes.number.isRequired,
	};

	render() {
		const { numLegendElements } = this.props;

		return (
			<div className="pie-chart__placeholder-legend">
				{ range( numLegendElements ).map( number => {
					return (
						<div key={ number } className="pie-chart__placeholder-legend-item">
							<div className="pie-chart__placeholder-legend-item-title">
								<svg
									className="pie-chart__placeholder-legend-drawing"
									viewBox={ `0 0 ${ SVG_SIZE } ${ SVG_SIZE }` }
								>
									<circle
										className="pie-chart__placeholder-drawing-element"
										cx={ SVG_SIZE / 2 }
										cy={ SVG_SIZE / 2 }
										r={ SVG_SIZE / 2 }
									/>
								</svg>
							</div>

							<div className="pie-chart__placeholder-legend-item-detail">
								<div key="detail-1" className="pie-chart__placeholder-legend-item-detail-element" />
								<div key="detail-2" className="pie-chart__placeholder-legend-item-detail-element" />
								<div key="detail-3" className="pie-chart__placeholder-legend-item-detail-element" />
							</div>
						</div>
					);
				} ) }
			</div>
		);
	}
}

export default PieChartLegendPlaceholder;
