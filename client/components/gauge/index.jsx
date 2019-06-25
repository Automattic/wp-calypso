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
	partialCircle = ( color, percent ) => {
		const start = 0.8 * Math.PI;
		const end = ( 0.8 + 1.4 * ( percent / 100 ) ) * Math.PI;
		const length = end - start;

		const center = this.props.size / 2;
		const radius = center - this.props.lineWidth / 2;

		const fromX = radius * Math.cos( start ) + center;
		const fromY = radius * Math.sin( start ) + center;
		const toX = radius * Math.cos( end ) + center;
		const toY = radius * Math.sin( end ) + center;
		const large = Math.abs( length ) <= Math.PI ? '0' : '1';
		const sweep = length < 0 ? '0' : '1';

		return (
			<path
				d={ `M ${ fromX } ${ fromY } A ${ radius } ${ radius } 0 ${ large } ${ sweep } ${ toX } ${ toY }` }
				fill="none"
				stroke={ color }
				stroke-width={ this.props.lineWidth }
				stroke-linecap="round"
			/>
		);
	};

	render() {
		const { size } = this.props;
		const wrapperStyles = {
			width: this.props.size,
			height: this.props.size,
		};
		const labelStyles = {
			color: this.props.colorFg,
			fontSize: this.props.labelSize + 'px',
		};
		const label = this.props.percentage + '%';

		const labelTop = this.props.size / 2 + this.props.labelSize;
		labelStyles.top = '-' + labelTop + 'px';

		return (
			<>
				<div className="gauge" style={ wrapperStyles }>
					<svg width={ size } height={ size } viewBox={ `0 0 ${ size } ${ size }` }>
						{ this.partialCircle( this.props.colorBg, 100 ) }
						{ this.partialCircle( this.props.colorFg, this.props.percentage ) }
					</svg>
					<span className="gauge__label" style={ labelStyles }>
						<span className="gauge__number">{ label }</span>
						<span className="gauge__metric">{ this.props.metric }</span>
					</span>
				</div>
			</>
		);
	}
}
