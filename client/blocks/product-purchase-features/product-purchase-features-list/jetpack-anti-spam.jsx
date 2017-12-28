/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PurchaseDetail from 'client/components/purchase-detail';

export default localize( ( { translate } ) => {
	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				icon="comment"
				title={ translate( 'Spam Filtering' ) }
				description={ translate( 'Spam is being automatically filtered.' ) }
			/>
		</div>
	);
} );
