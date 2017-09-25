/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import PurchaseDetail from 'components/purchase-detail';

export default localize( ( { translate } ) => {
	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				icon="flag"
				title={ translate( 'Site Security' ) }
				description={ translate(
					'Your site is being securely backed up and scanned with real-time sync.'
				) }
				buttonText={ translate( 'Visit security dashboard' ) }
				href="https://dashboard.vaultpress.com/" />
		</div>
	);
} );
