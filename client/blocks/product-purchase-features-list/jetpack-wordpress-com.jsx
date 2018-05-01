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
				icon={ <img alt="" src="/calypso/images/illustrations/jetpack-updates.svg" /> }
				title={ translate( 'Automatic Updates' ) }
				description={ translate(
					'Keep your plugins up-to-date, hassle-free.',
				) }
				buttonText={ translate( 'Configure auto updates' ) }
				href={ `/plugins/manage/${ selectedSite.slug }` }
			/>
		</div>
	);
} );
