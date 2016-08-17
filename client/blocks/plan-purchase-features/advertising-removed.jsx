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
		<div className="plan-purchase-features__item">
			<PurchaseDetail
				icon="speaker"
				title={ translate( 'Advertising Removed' ) }
				description={ isBusinessPlan
					? translate( 'With your plan, all WordPress.com advertising has been removed from your site.' )
					: translate( 'With your plan, all WordPress.com advertising has been removed from your site.' +
						' You can upgrade to a Business plan to also remove the WordPress.com footer credit.' )
				}
			/>
		</div>
	);
} );
