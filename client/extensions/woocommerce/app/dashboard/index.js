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

export default class Dashboard extends Component {

	render() {
		return (
			<Main className="woocommerce dashboard">
				<SectionHeader label="WooCommerce Store" />
				<Card>
					<p>This is the start of something great!</p>
					<p>This will be the home for your WooCommerce Store integration with WordPress.com.</p>
				</Card>
			</Main>
		);
	}

}
