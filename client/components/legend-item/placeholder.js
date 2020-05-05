/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';

const SVG_SIZE = 30;

class LegendItemPlaceholder extends Component {
	static propTypes = {
		description: PropTypes.string,
		name: PropTypes.string.isRequired,
	};

	render() {
		const { description, name } = this.props;

		return (
			<div className="legend-item__placeholder">
				<div className="legend-item__placeholder-title">
					<svg
						className="legend-item__placeholder-title-sample-drawing"
						viewBox={ `0 0 ${ SVG_SIZE } ${ SVG_SIZE }` }
					>
						<circle
							className="legend-item__placeholder-title-circle"
							cx={ SVG_SIZE / 2 }
							cy={ SVG_SIZE / 2 }
							r={ SVG_SIZE / 2 }
						/>
					</svg>

					<div className={ 'legend-item__placeholder-title-name' }>{ name }</div>
				</div>

				<div className="legend-item__placeholder-detail">
					<div className={ 'legend-item__placeholder-detail-value' }>{ '100 (100%)' }</div>
					{ description && (
						<div className={ 'legend-item__placeholder-detail-description' }>{ description }</div>
					) }
				</div>
			</div>
		);
	}
}

export default LegendItemPlaceholder;
