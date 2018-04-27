/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PurchaseDetail from 'components/purchase-detail';

export default localize( ( { translate } ) => {
	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				buttonText={ translate( 'Start earning' ) }
				description={ translate(
					'Add a PayPal payment button and start selling your goods and services.'
				) }
				href={ 'theme' }
				icon={ <img alt="" src="/calypso/images/illustrations/jetpack-payments.svg" /> }
				target={ '' }
				title={ translate( 'Sell online with PayPal.' ) }
			/>
		</div>
	);
} );
