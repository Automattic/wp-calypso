import PropTypes from 'prop-types';
import { Component, cloneElement } from 'react';

import './style.scss';

export { default as LegendItemPlaceholder } from './placeholder';

const SVG_SIZE = 30;
const noop = () => {};

class LegendItem extends Component {
	static propTypes = {
		circleClassName: PropTypes.string.isRequired,
		description: PropTypes.string,
		onMouseOver: PropTypes.func,
		onMouseOut: PropTypes.func,
		name: PropTypes.string.isRequired,
		percent: PropTypes.string,
		seriesIndex: PropTypes.number,
		value: PropTypes.string,
		svgElement: PropTypes.element,
	};

	static defaultProps = {
		onMouseOver: noop,
		onMouseOut: noop,
	};

	handleMouseOver = () => {
		this.props.onMouseOver( this.props.seriesIndex );
	};

	handleMouseOut = () => {
		this.props.onMouseOut( this.props.seriesIndex );
	};

	renderValueAndPercent() {
		const { percent, value } = this.props;

		let valueString = '';
		if ( value && percent ) {
			valueString = `${ value } (${ percent }%)`;
		} else if ( value ) {
			valueString = value;
		} else if ( percent ) {
			valueString = percent === '0' ? '-' : `${ percent }%`;
		}

		return valueString.length > 0 ? (
			<div className="legend-item__detail-value">{ valueString }</div>
		) : null;
	}

	render() {
		const { circleClassName, description, name, svgElement } = this.props;

		return (
			<div
				className="legend-item"
				/* eslint-disable jsx-a11y/mouse-events-have-key-events */
				onMouseOver={ this.handleMouseOver }
				onMouseOut={ this.handleMouseOut }
				/* eslint-enable jsx-a11y/mouse-events-have-key-events */
			>
				<div className="legend-item__title">
					{ svgElement ? (
						cloneElement( svgElement, { className: circleClassName } )
					) : (
						<svg
							className="legend-item__title-sample-drawing"
							viewBox={ `0 0 ${ SVG_SIZE } ${ SVG_SIZE }` }
						>
							<circle
								className={ circleClassName }
								cx={ SVG_SIZE / 2 }
								cy={ SVG_SIZE / 2 }
								r={ SVG_SIZE / 2 }
							/>
						</svg>
					) }

					<div className="legend-item__title-name">{ name }</div>
				</div>

				<div className="legend-item__detail">
					{ this.renderValueAndPercent() }
					{ description && <div className="legend-item__detail-description">{ description }</div> }
				</div>
			</div>
		);
	}
}

export default LegendItem;
