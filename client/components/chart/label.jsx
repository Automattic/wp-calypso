/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

export default class ChartLabel extends React.PureComponent {
	static propTypes = {
		isRtl: PropTypes.bool,
		label: PropTypes.string.isRequired,
		width: PropTypes.number.isRequired,
		x: PropTypes.number.isRequired,
	};

	render() {
		const labelStyle = {
			[ this.props.isRtl ? 'right' : 'left' ]: this.props.x + 'px',
			width: this.props.width + 'px',
		};

		return (
			<div className="chart__x-axis-label" style={ labelStyle }>
				{ this.props.label }
			</div>
		);
	}
}
