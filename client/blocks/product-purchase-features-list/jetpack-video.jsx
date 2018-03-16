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
				icon="image-multiple"
				title={ translate( 'Video Hosting' ) }
				description={ translate(
					'High-speed, high-definition video hosting that uses your server space efficiently, ' + 
						' and comes with no third-party ads.'
				) }
			/>
		</div>
	);
} );
