/**
 * External dependencies
 */

import { Component } from '@wordpress/element';
import classnames from 'classnames';

/**
 * Internal dependencies
 */

/**
 * Module variables
 */

class ChartSave extends Component {
	render() {
		const {
			attributes,
			className,
		} = this.props;
		const {
			align,
			chart_type,
			googlesheet_url,
			number_format,
			x_axis_label,
			y_axis_label,
		} = attributes;
		const classes = classnames(
			className,
			align ? `align${ align }` : null,
		);
		return (
			<div
				className={ classes }
				data-googlesheet_url={ googlesheet_url }
				data-x_axis_label={ x_axis_label }
				data-y_axis_label={ y_axis_label }
				data-chart_type={ chart_type }
				data-number_format={ number_format }
			/>
		);
	}
}

export default ChartSave;
