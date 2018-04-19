/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

const SVG_SIZE = 30;

class LegendItem extends Component {
	static propTypes = {
		description: PropTypes.string,
		name: PropTypes.string.isRequired,
		percent: PropTypes.string.isRequired,
		sectionNumber: PropTypes.number.isRequired,
		value: PropTypes.number.isRequired,
	};

	render() {
		const { description, name, percent, sectionNumber, value } = this.props;

		return (
			<div className={ 'pie-chart__legend-item' }>
				<div className={ 'pie-chart__legend-item-title' }>
					<svg
						className={ 'pie-chart__legend-item-title-sample-drawing' }
						viewBox={ `0 0 ${ SVG_SIZE } ${ SVG_SIZE }` }
					>
						<circle
							className={ `pie-chart__legend-sample-${ sectionNumber }` }
							cx={ SVG_SIZE / 2 }
							cy={ SVG_SIZE / 2 }
							r={ SVG_SIZE / 2 }
						/>
					</svg>

					<div className={ 'pie-chart__legend-item-title-name' }>
						{ name }
					</div>
				</div>

				<div className={ 'pie-chart__legend-item-detail' }>
					<div className={ 'pie-chart__legend-item-detail-value' }>
						{ `${ value } (${ percent }%)` }
					</div>

					{ description && (
						<div className={ 'pie-chart__legend-item-detail-description' }>
							{ description }
						</div>
					) }
				</div>
			</div>
		);
	}
}

export default LegendItem;
