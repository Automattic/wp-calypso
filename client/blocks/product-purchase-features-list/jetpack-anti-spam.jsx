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
				icon={ <img alt="" src="/calypso/images/illustrations/jetpack-spam.svg" /> }
				title={ translate( 'Spam Filtering' ) }
				description={ translate( 'Spam is automatically blocked from your comments.' ) }
				buttonText={ translate( 'View settings' ) }
				href={ `/settings/security/${ selectedSite.slug }` }
			/>
		</div>
	);
} );
