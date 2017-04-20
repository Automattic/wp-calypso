/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import StatsNavigation from './stats-navigation';

export default class Stats extends Component {
	render() {
		return (
			<Main className="woocommerce stats" wideLayout={ true }>
				<StatsNavigation />
			</Main>
		);
	}
}
