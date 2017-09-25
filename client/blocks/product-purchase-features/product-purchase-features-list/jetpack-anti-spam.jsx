/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

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
				description={ translate(
					'Spam is being automatically filtered.'
				) }
			/>
		</div>
	);
} );
