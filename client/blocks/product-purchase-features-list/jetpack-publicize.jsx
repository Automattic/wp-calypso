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
				icon={ <img alt="" src="/calypso/images/illustrations/jetpack-marketing.svg" /> }
				title={ translate( 'Marketing Automation' ) }
				description={ translate(
					'Schedule unlimited tweets, Facebook posts, and other social posts in advance.'
				) }
			/>
		</div>
	);
} );
