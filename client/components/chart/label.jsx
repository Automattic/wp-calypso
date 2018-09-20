/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';

export default class ModuleChartLabel extends React.Component {
	static propTypes = {
		isRtl: PropTypes.bool,
		width: PropTypes.number.isRequired,
		x: PropTypes.number.isRequired,
		label: PropTypes.string.isRequired,
	};

	render() {
		const { isRtl } = this.props;

		const labelStyle = {
			[ isRtl ? 'right' : 'left' ]: this.props.x + 'px',
			width: this.props.width + 'px',
		};

		return (
			<div className="chart__x-axis-label" style={ labelStyle }>
				{ this.props.label }
			</div>
		);
	}
}
