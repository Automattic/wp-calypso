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
				title={ translate( 'Marketing Automation' ) }
				description={ translate(
					'Schedule tweets, Facebook posts, and other social posts in advance. ' + 'No limits.'
				) }
			/>
		</div>
	);
} );
