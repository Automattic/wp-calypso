/** @format */

/**
 * Wordpress dependencies
 */

import { Component, Fragment } from '@wordpress/element';

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */

import config from './config.js';

export class Navigation extends Component {

	render() {
		const { children } = this.props;
		return (
			<Fragment>
				<header>Placeholder Header</header>
				{ children }
				<header>Placeholder Footer</header>
			</Fragment>
		);
	}

}

export default Navigation;
