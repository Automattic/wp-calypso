/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';

/**
 * Internal dependencies
 */
import SegmentedControl from 'components/segmented-control';
import SitesDropdown from 'components/sites-dropdown';
import ProductSelector from '../';

const products = [
	{
		title: 'Jetpack Backup',
		description: (
			<p>
				Always-on backups ensure you never lose your site. Choose from real-time or daily backups.{' '}
				<a href="https://jetpack.com/">Which one do I need?</a>
			</p>
		),
		id: 'jetpack_backup',
		options: {
			yearly: [ 'jetpack_backup_daily', 'jetpack_backup_realtime' ],
			monthly: [ 'jetpack_backup_daily_monthly', 'jetpack_backup_realtime_monthly' ],
		},
		optionDescriptions: {
			jetpack_backup_daily: (
				<p>
					<strong>Looking for more?</strong> With Real-time backups, we save as you edit and you’ll
					get unlimited backup archives
				</p>
			),
			jetpack_backup_daily_monthly: (
				<p>
					<strong>Looking for more?</strong> With Real-time backups, we save as you edit and you’ll
					get unlimited backup archives
				</p>
			),
			jetpack_backup_realtime: (
				<p>
					Always-on backups ensure you never lose your site. Your changes are saved as you edit and
					you have unlimited backup archives
				</p>
			),
			jetpack_backup_realtime_monthly: (
				<p>
					Always-on backups ensure you never lose your site. Your changes are saved as you edit and
					you have unlimited backup archives
				</p>
			),
		},
		optionNames: {
			jetpack_backup_daily: 'Daily Backups',
			jetpack_backup_daily_monthly: 'Daily Backups',
			jetpack_backup_realtime: 'Real-Time Backups',
			jetpack_backup_realtime_monthly: 'Real-Time Backups',
		},
		optionsLabel: 'Backup options',
	},
];

class ProductSelectorExample extends Component {
	state = {
		interval: 'yearly',
		siteId: 0,
	};

	handleIntervalChange( interval ) {
		return () => {
			this.setState( {
				interval,
			} );
		};
	}

	render() {
		return (
			<Fragment>
				<SegmentedControl compact primary style={ { width: 250, margin: '0 auto 10px' } }>
					<SegmentedControl.Item
						selected={ this.state.interval === 'monthly' }
						onClick={ this.handleIntervalChange( 'monthly' ) }
					>
						Monthly billing
					</SegmentedControl.Item>
					<SegmentedControl.Item
						selected={ this.state.interval === 'yearly' }
						onClick={ this.handleIntervalChange( 'yearly' ) }
					>
						Yearly billing
					</SegmentedControl.Item>
				</SegmentedControl>

				<div style={ { maxWidth: 520, margin: '0 auto' } }>
					<div style={ { maxWidth: 300, margin: '0 auto 10px' } }>
						<SitesDropdown onSiteSelect={ siteId => this.setState( { siteId } ) } />
					</div>

					{ this.state.siteId ? (
						<ProductSelector
							products={ products }
							intervalType={ this.state.interval }
							siteId={ this.state.siteId }
						/>
					) : (
						<p style={ { textAlign: 'center' } }>
							Please, select a Jetpack site to experience the full demo.
						</p>
					) }
				</div>
			</Fragment>
		);
	}
}

ProductSelectorExample.displayName = 'ProductSelector';

export default ProductSelectorExample;
