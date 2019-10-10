/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import Product from './product';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';

/**
 * Style dependencies
 */
import './style.scss';

const PlansSingleProducts = props => {
	const { billingTimeFrame, currencyCode, isPlaceholder, productProperties } = props;
	const displayBackup = isEnabled( 'plans/jetpack-backup' );
	const displayScan = isEnabled( 'plans/jetpack-scan' );

	return (
		<div className="plans-single-products">
			{ displayScan && (
				<Product
					billingTimeFrame={ billingTimeFrame }
					currencyCode={ currencyCode }
					isPlaceholder={ isPlaceholder }
					{ ...productProperties.jetpackScan }
				/>
			) }
			{ displayBackup && (
				<Product
					billingTimeFrame={ billingTimeFrame }
					currencyCode={ currencyCode }
					isPlaceholder={ isPlaceholder }
					{ ...productProperties.jetpackBackup }
				/>
			) }
		</div>
	);
};

export default connect( state => {
	return {
		billingTimeFrame: 'per year',
		currencyCode: getCurrentUserCurrencyCode( state ),
		isPlaceholder: false,
		productProperties: {
			jetpackScan: {
				discountedPrice: 10,
				fullPrice: 16,
				moreInfoLabel: 'More info',
				productDescription:
					'Automatic scanning and one-click fixes keep your site one step ahead of security threats.',
				title: 'Jetpack Scan',
			},
			jetpackBackup: {
				discountedPrice: 16,
				fullPrice: 25,
				moreInfoLabel: 'Which one do I need?',
				productDescription:
					'Always-on backups ensure you never lose your site. Choose from real-time or daily backups.',
				title: 'Jetpack Backup',
			},
		},
	};
} )( PlansSingleProducts );
