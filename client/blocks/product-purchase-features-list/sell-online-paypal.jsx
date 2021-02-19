/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PurchaseDetail from 'calypso/components/purchase-detail';
import { localizeUrl } from 'calypso/lib/i18n-utils';

/**
 * Image dependencies
 */
import paymentsImage from 'calypso/assets/images/illustrations/payments.svg';

export default localize( ( { isJetpack, translate } ) => {
	const supportDocLink = localizeUrl(
		isJetpack
			? 'https://jetpack.com/support/pay-with-paypal/'
			: 'https://wordpress.com/support/pay-with-paypal/'
	);
	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				buttonText={ translate( 'Collect PayPal payments' ) }
				description={ translate(
					'Add a button to any post or page to collect PayPal payments for physical products, services, or donations.'
				) }
				href={ supportDocLink }
				icon={ <img alt="" src={ paymentsImage } /> }
				target="_blank"
				title={ translate( 'Sell online with PayPal' ) }
			/>
		</div>
	);
} );
