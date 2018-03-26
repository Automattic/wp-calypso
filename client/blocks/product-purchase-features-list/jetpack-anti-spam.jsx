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

export default localize( ( { translate } ) => {
	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				icon="comment"
				title={ translate( 'Spam Filtering' ) }
				description={ translate( 'Spam is automatically blocked from your comments.' ) }
			/>
		</div>
	);
} );
