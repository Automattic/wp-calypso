/**
 * External dependencies
 */

import {
	Component,
	Fragment,
} from '@wordpress/element';

/**
 * Internal dependencies
 */

export class Chart extends Component {
	constructor() {
		super( ...arguments );
		this.state = {};
	}
	render() {
		const {
			googlesheet_url,
			x_axis_label,
			y_axis_label,
			chart_type,
			number_format,
		} = this.props;
		return (
			<Fragment>
				<p>Hello Component</p>
				<p>googlesheet_url: { googlesheet_url }</p>
				<p>x_axis_label: { x_axis_label }</p>
				<p>y_axis_label: { y_axis_label }</p>
				<p>chart_type: { chart_type }</p>
				<p>number_format: { number_format }</p>
			</Fragment>
		);
	}
}

Chart.defaultProps = {
	googlesheet_url: '',
	x_axis_label: '',
	y_axis_label: '',
	chart_type: '',
	number_format: '',
};

export default Chart;
