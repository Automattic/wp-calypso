/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import MyCoolComponent from '../stats/my-cool-component';

export default class Dashboard extends Component {

	render() {
		return (
			<Main className="woocommerce__main">
				<SectionHeader label="WooCommerce Store" />
				<Card>
					<p>This is the start of something great!</p>
					<p>This will be the home for your WooCommerce Store integration with WordPress.com.</p>
				</Card>
				<Card>
					<MyCoolComponent/>
				</Card>
			</Main>
		);
	}

}
