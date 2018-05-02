/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';

const SVG_SIZE = 300;

class PieChartPlaceholder extends Component {
	static propTypes = {
		title: PropTypes.bool,
	};

	static defaultProps = {
		title: false,
	};

	render() {
		const { title } = this.props;
		return (
			<div className={ 'pie-chart__placeholder' }>
				<svg
					className={ 'pie-chart__placeholder-drawing' }
					viewBox={ `0 0 ${ SVG_SIZE } ${ SVG_SIZE }` }
					preserveAspectRatio={ 'xMidYMid meet' }
				>
					<g transform={ `translate(${ SVG_SIZE / 2 }, ${ SVG_SIZE / 2 })` }>
						<circle
							cx={ 0 }
							cy={ 0 }
							r={ SVG_SIZE / 2 }
							className="pie-chart__placeholder-drawing-element"
						/>
					</g>
				</svg>
				{ title && <div className={ 'pie-chart__placeholder-title' } /> }
			</div>
		);
	}
}

export default PieChartPlaceholder;
