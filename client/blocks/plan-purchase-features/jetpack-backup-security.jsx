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
		<div className="plan-purchase-features__item">
			<PurchaseDetail
				icon="flag"
				title={ translate( 'Backups & Security' ) }
				description={ translate(
					'VaultPress makes it easy to keep an up-to-date backup of your site with both daily and real-time syncing of all ' +
					'your WordPress content. To ensure your site stays safe, VaultPress performs security scans daily and makes it ' +
					'easy to review and fix threats.'
				) }
				buttonText={ translate( 'View your backups' ) }
				href="https://dashboard.vaultpress.com/" />
		</div>
	);
} );
