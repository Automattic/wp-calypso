/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';

/**
 * Internal dependencies
 */
import SegmentedControl from 'components/segmented-control';
import ProductSelector from '../';

const products = [
	{
		title: 'Jetpack Backup',
		description: (
			<Fragment>
				Automatic scanning and one-click fixes keep your site one step ahead of security threats.{' '}
				<a href="https://jetpack.com/">More info</a>
			</Fragment>
		),
		id: 'jetpack_backup',
		options: {
			yearly: [ 'jetpack_backup_daily', 'jetpack_backup_realtime' ],
			monthly: [ 'jetpack_backup_daily_monthly', 'jetpack_backup_realtime_monthly' ],
		},
		optionsLabel: 'Backup options',
	},
	{
		title: 'Jetpack Plan',
		description: <Fragment>A Jetpack subscription of your choice.</Fragment>,
		id: 'jetpack_plan',
		options: {
			yearly: [ 'jetpack_personal', 'jetpack_premium', 'jetpack_business' ],
			monthly: [
				'jetpack_personal_monthly',
				'jetpack_premium_monthly',
				'jetpack_business_monthly',
			],
		},
		optionsLabel: 'Plan options',
	},
];

class ProductSelectorExample extends Component {
	state = {
		interval: 'yearly',
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
					<ProductSelector products={ products } intervalType={ this.state.interval } />
				</div>
			</Fragment>
		);
	}
}

ProductSelectorExample.displayName = 'ProductSelector';

export default ProductSelectorExample;
