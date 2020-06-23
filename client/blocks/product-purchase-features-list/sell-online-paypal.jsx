/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PurchaseDetail from 'components/purchase-detail';
import { localizeUrl } from 'lib/i18n-utils';
import { isEnabled } from 'config';

/**
 * Image dependencies
 */
import paymentsImage from 'assets/images/illustrations/payments.svg';

export default localize( ( { isJetpack, translate } ) => {
	let supportDocLink;
	if ( isEnabled( 'earn/rename-payment-blocks' ) ) {
		supportDocLink = localizeUrl(
			isJetpack
				? 'https://jetpack.com/support/pay-with-paypal/'
				: 'https://wordpress.com/support/pay-with-paypal/'
		);
	} else {
		supportDocLink = localizeUrl(
			isJetpack
				? 'https://jetpack.com/support/simple-payment-button/'
				: 'https://wordpress.com/support/simple-payments/'
		);
	}
	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				buttonText={
					isEnabled( 'earn/rename-payment-blocks' )
						? translate( 'Collect PayPal payments' )
						: translate( 'Collect payments' )
				}
				description={
					isEnabled( 'earn/rename-payment-blocks' )
						? translate(
								'Add a button to any post or page to collect PayPal payments for physical products, digital goods, services, or donations.'
						  )
						: translate(
								'Add a payment button to any post or page to collect PayPal payments for physical products, digital goods, services, or donations.'
						  )
				}
				href={ supportDocLink }
				icon={ <img alt="" src={ paymentsImage } /> }
				target="_blank"
				title={ translate( 'Sell online with PayPal' ) }
			/>
		</div>
	);
} );
