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
				icon={ <img alt="" src="/calypso/images/illustrations/jetpack-video-hosting.svg" /> }
				title={ translate( 'Video Hosting' ) }
				description={ translate(
					'High-speed, high-definition video hosting with no third-party ads.'
				) }
				buttonText={ translate( 'Activate' ) }
				href={ `/media/videos/${ selectedSite.slug }` }
			/>
		</div>
	);
} );
