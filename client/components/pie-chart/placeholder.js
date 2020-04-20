/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

const SVG_SIZE = 300;

class PieChartPlaceholder extends Component {
	static propTypes = {
		title: PropTypes.oneOfType( [ PropTypes.string, PropTypes.func ] ),
	};

	static defaultProps = {
		title: null,
	};

	render() {
		const { title, translate } = this.props;
		return (
			<div className="pie-chart__placeholder">
				<svg
					className="pie-chart__placeholder-drawing"
					viewBox={ `0 0 ${ SVG_SIZE } ${ SVG_SIZE }` }
					preserveAspectRatio={ 'xMidYMid meet' }
				>
					<g transform={ `translate(${ SVG_SIZE / 2}, ${ SVG_SIZE / 2})` }>
						<circle
							cx={ 0 }
							cy={ 0 }
							r={ SVG_SIZE / 2 }
							className="pie-chart__placeholder-drawing-element"
						/>
					</g>
				</svg>

				{ title && (
					<h2 className="pie-chart__placeholder-title">
						{ 'string' === typeof title ? title : title( translate, 0 ) }
					</h2>
				) }
			</div>
		);
	}
}

export default localize( PieChartPlaceholder );
