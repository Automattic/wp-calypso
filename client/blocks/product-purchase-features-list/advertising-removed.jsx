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

export default localize( ( { isBusinessPlan, translate } ) => {
	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				icon={ <img alt="" src="/calypso/images/upgrades/advertising-removed.svg" /> }
				title={ translate( 'Advertising removed' ) }
				description={
					isBusinessPlan
						? translate( 'All WordPress.com advertising has been removed from your site.' )
						: translate(
								'All WordPress.com advertising has been removed from your site. ' +
									'Upgrade to remove the WordPress.com footer credit.'
							)
				}
			/>
		</div>
	);
} );
