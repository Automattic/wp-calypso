/**
 * Wordpress dependencies
 */

import { Component } from '@wordpress/element';

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */

export class Starter extends Component {
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

Starter.defaultProps = {
	foo: ''
};

export default Starter;
