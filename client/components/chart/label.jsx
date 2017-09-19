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

module.exports = React.createClass( {
	displayName: 'ModuleChartLabel',

	propTypes: {
		width: PropTypes.number.isRequired,
		x: PropTypes.number.isRequired,
		label: PropTypes.string.isRequired
	},

	render: function() {
		const dir = user.isRTL() ? 'right' : 'left';
		let labelStyle;

		labelStyle = {
			width: this.props.width + 'px'
		};

		labelStyle[ dir ] = this.props.x + 'px';

		return <div className="chart__x-axis-label" style={ labelStyle }>{ this.props.label }</div>;
	}
} );
