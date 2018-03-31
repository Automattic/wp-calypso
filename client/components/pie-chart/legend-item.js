/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

const SVG_SIZE = 30;

class LegendItem extends Component {
	static propTypes = {
		name: PropTypes.string.isRequired,
		sectionNumber: PropTypes.number.isRequired,
		value: PropTypes.number.isRequired,
		description: PropTypes.string,
		percent: PropTypes.string,
	};

	render() {
		const { name, sectionNumber, value, percent, description } = this.props;
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
					<div className={ 'pie-chart__legend-item-title-name' }>{ name }</div>
				</div>
				<div className={ 'pie-chart__legend-item-detail' }>
					<div className={ 'pie-chart__legend-item-detail-value' }>
						{ percent ? `${ value } (${ percent }%)` : `${ value }` }
					</div>
					{ description ? (
						<div className={ 'pie-chart__legend-item-detail-description' }>{ description }</div>
					) : (
						''
					) }
				</div>
			</div>
		);
	}
}

export default localize( LegendItem );
