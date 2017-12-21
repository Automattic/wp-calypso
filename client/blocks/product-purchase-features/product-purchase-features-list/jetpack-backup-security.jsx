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

export default localize( ( { selectedSite, translate } ) => {
	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				icon="flag"
				title={ translate( 'Site Security' ) }
				description={ translate(
					'Your site is being securely backed up and scanned with real-time sync.'
				) }
				buttonText={ translate( 'Visit Activity Log' ) }
				href={ `/stats/activity/${ selectedSite.slug }` }
			/>
		</div>
	);
} );
