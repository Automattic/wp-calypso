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
				icon="image-multiple"
				title={ translate( 'Video Hosting' ) }
				description={ translate(
					'High-speed video hosting that doesn\'t eat up your server space. ' +
					'High-definition and no third-party ads.'
				) }
			/>
		</div>
	);
} );
