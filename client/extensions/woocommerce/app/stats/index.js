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

export default class Stats extends Component {

	render() {
		return (
			<Main className="stats woocommerce">
				<SectionHeader label="WooCommerce Store - Stats" />
				<Card>
					<p>This will be the home for your WooCommerce Store Stats</p>
				</Card>
			</Main>
		);
	}

}
