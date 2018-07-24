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

export default localize( ( { isBusinessPlan, selectedSite, translate } ) => {
	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				icon={ <img alt="" src="/calypso/images/illustrations/ads-removed.svg" /> }
				title={ translate( 'Advertising removed' ) }
				description={
					isBusinessPlan
						? translate( 'All WordPress.com advertising has been removed from your site.' )
						: translate(
								'All WordPress.com advertising has been removed from your site. Upgrade to Business ' +
									'to remove the WordPress.com footer credit.'
						  )
				}
				buttonText={ ! isBusinessPlan ? translate( 'Upgrade to Business' ) : null }
				href={ ! isBusinessPlan ? '/checkout/' + selectedSite.slug + '/business' : null }
			/>
		</div>
	);
} );
