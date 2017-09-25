/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';

/**
 * Internal dependencies
 */
import userModule from 'lib/user';

/**
 * Module variables
 */
const user = userModule();

export default class extends React.Component {
	static displayName = 'ModuleChartLabel';

	static propTypes = {
		width: PropTypes.number.isRequired,
		x: PropTypes.number.isRequired,
		label: PropTypes.string.isRequired
	};

	render() {
		const dir = user.isRTL() ? 'right' : 'left';
		let labelStyle;

		labelStyle = {
			width: this.props.width + 'px'
		};

		labelStyle[ dir ] = this.props.x + 'px';

		return <div className="chart__x-axis-label" style={ labelStyle }>{ this.props.label }</div>;
	}
}
