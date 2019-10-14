/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import Product from './product';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import Button from 'components/button';

/**
 * Style dependencies
 */
import './style.scss';

class PlansSingleProducts extends Component {
	renderJetpackBackup() {
		const {
			billingTimeFrame,
			currencyCode,
			isPlaceholder,
			onProductChange,
			productProperties,
			selectedProduct,
		} = this.props;

		if ( ! isEnabled( 'plans/jetpack-backup' ) ) {
			return null;
		}

		return (
			<Product
				billingTimeFrame={ billingTimeFrame }
				currencyCode={ currencyCode }
				isPlaceholder={ isPlaceholder }
				onChange={ onProductChange }
				selectedProduct={ selectedProduct }
				{ ...productProperties.jetpackBackup }
			/>
		);
	}

	renderUpgradeButton() {
		const { onUpgrade, selectedProduct } = this.props;

		return (
			<div className="plans-single-products__actions">
				<Button className="plans-single-products__actions-button" onClick={ onUpgrade } primary>
					{ selectedProduct === 'jetpack_backup_realtime'
						? // @todo: Add i18n once the copy in the designs is final.
						  'Upgrade to Real-Time Backups'
						: 'Upgrade to Daily Backups' }
				</Button>
			</div>
		);
	}

	render() {
		return (
			<div className="plans-single-products">
				{ this.renderJetpackBackup() }
				{ this.renderUpgradeButton() }
			</div>
		);
	}
}

export default connect(
	state => {
		return {
			billingTimeFrame: 'per year',
			currencyCode: getCurrentUserCurrencyCode( state ),
			isPlaceholder: false,
			productProperties: {
				jetpackBackup: {
					discountedPrice: 16,
					fullPrice: 25,
					moreInfoLabel: 'Which one do I need?',
					options: [
						{
							discountedPrice: 12,
							fullPrice: 14,
							slug: 'jetpack_backup_daily',
							title: 'Daily Backups',
						},
						{
							discountedPrice: 16,
							fullPrice: 25,
							slug: 'jetpack_backup_realtime',
							title: 'Real-Time Backups',
						},
					],
					optionsHeading: 'Backup Options:',
					productDescription:
						'Always-on backups ensure you never lose your site. Choose from real-time or daily backups.',
					slug: 'jetpack-backup',
					title: 'Jetpack Backup',
				},
			},
			selectedProduct: 'jetpack_backup_realtime',
		};
	},
	() => {
		return {
			onProductChange: () => {
				return null;
			},
			onUpgrade: () => {
				return null;
			},
		};
	}
)( PlansSingleProducts );
