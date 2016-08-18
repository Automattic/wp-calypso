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
		<div className="plan-purchase-features__item">
			<PurchaseDetail
				icon="house"
				title={ translate( 'Return to your site\'s dashboard' ) }
				buttonText={ translate( 'Go back to %(site)s', { args: { site: selectedSite.name } } ) }
				href={ `${selectedSite.URL}/wp-admin/` }
			/>
		</div>
	);
} );
