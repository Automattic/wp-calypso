/**
 * External dependencies
 */

import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */

export class Chart extends Component {
	constructor() {
		super( ...arguments );
		this.state = {};
	}
	render() {
		const { foo } = this.props;
		return (
			<p>Hello Component: { foo }</p>
		);
	}
}

Chart.defaultProps = {
	foo: ''
};

export default Chart;
