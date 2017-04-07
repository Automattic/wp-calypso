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
import SegmentedControl from 'components/segmented-control';
import MyCoolComponent from './my-cool-component';

export default class Stats extends Component {

	render() {
		return (
			<Main className="stats woocommerce__main">
				<SegmentedControl
					initialSelected="store"
					options={ [
						{ value: 'site', label: 'Site', path: '/stats/day/<-my-cool-site->' },
						{ value: 'store', label: 'Store' },
					] }
				/>
				<SectionHeader label="WooCommerce Store - Stats" />
				<Card>
					<MyCoolComponent/>
				</Card>
			</Main>
		);
	}

}
