/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';

const SVG_SIZE = 30;

class LegendItem extends Component {
	static propTypes = {
		circleClassName: PropTypes.string.isRequired,
		description: PropTypes.string,
		name: PropTypes.string.isRequired,
		percent: PropTypes.string,
		value: PropTypes.string,
	};

	renderValueAndPercent() {
		const { percent, value } = this.props;

		let valueString = '';

		if ( value && percent ) {
			valueString = `${ value } (${ percent }%)`;
		} else if ( value ) {
			valueString = value;
		} else if ( percent ) {
			valueString = `${ percent }%`;
		}

		return valueString.length > 0 ? (
			<div className={ 'legend-item__detail-value' }>{ valueString }</div>
		) : null;
	}

	render() {
		const { circleClassName, description, name } = this.props;

		return (
			<div className="legend-item">
				<div className="legend-item__title">
					<svg
						className={ 'legend-item__title-sample-drawing' }
						viewBox={ `0 0 ${ SVG_SIZE } ${ SVG_SIZE }` }
					>
						<circle
							className={ circleClassName }
							cx={ SVG_SIZE / 2 }
							cy={ SVG_SIZE / 2 }
							r={ SVG_SIZE / 2 }
						/>
					</svg>

					<div className={ 'legend-item__title-name' }>{ name }</div>
				</div>

				<div className="legend-item__detail">
					{ this.renderValueAndPercent() }
					{ description && (
						<div className={ 'legend-item__detail-description' }>{ description }</div>
					) }
				</div>
			</div>
		);
	}
}

export default LegendItem;
