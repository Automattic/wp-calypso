/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Style Dependencies
 */
import './style.scss';

export default class extends React.PureComponent {
	static displayName = 'Gauge';

	static propTypes = {
		percentage: PropTypes.number.isRequired,
		size: PropTypes.number,
		colorBg: PropTypes.string,
		colorFg: PropTypes.string,
		lineWidth: PropTypes.number,
		metric: PropTypes.string.isRequired,
	};

	static defaultProps = {
		size: 118,
		lineWidth: 9,
		labelSize: 32,
		colorBg: '#e9eff3',
		colorFg: '#00aadc',
	};

	// See https://stackoverflow.com/a/18473154/1432801
	// Renders 2d-canvas like circle segment arcs as svg path
	getPathDefinition = ( percent ) => {
		const { lineWidth, size } = this.props;
		const start = 0.8 * Math.PI;
		const end = ( 0.8 + 1.4 * ( percent / 100 ) ) * Math.PI;
		const length = end - start;

		const center = size / 2;
		const radius = center - lineWidth / 2;

		const fromX = radius * Math.cos( start ) + center;
		const fromY = radius * Math.sin( start ) + center;
		const toX = radius * Math.cos( end ) + center;
		const toY = radius * Math.sin( end ) + center;
		const large = Math.abs( length ) <= Math.PI ? '0' : '1';
		const sweep = length < 0 ? '0' : '1';

		return `M ${ fromX } ${ fromY } A ${ radius } ${ radius } 0 ${ large } ${ sweep } ${ toX } ${ toY }`;
	};

	render() {
		const { colorBg, colorFg, labelSize, lineWidth, metric, percentage, size } = this.props;
		const labelStyles = {
			fontSize: labelSize + 'px',
			top: `-${ size / 2 + labelSize }px`,
		};

		return (
			<>
				<div className="gauge" style={ { height: size, width: size } }>
					<svg width={ size } height={ size } viewBox={ `0 0 ${ size } ${ size }` }>
						<path
							d={ this.getPathDefinition( 100 ) }
							fill="none"
							stroke={ colorBg }
							strokeWidth={ lineWidth }
							strokeLinecap="round"
						/>
						<path
							d={ this.getPathDefinition( percentage ) }
							fill="none"
							stroke={ colorFg }
							strokeWidth={ lineWidth }
							strokeLinecap="round"
						/>
					</svg>
					<span className="gauge__label" style={ labelStyles }>
						<span className="gauge__number">{ percentage }%</span>
						<span className="gauge__metric">{ metric }</span>
					</span>
				</div>
			</>
		);
	}
}
