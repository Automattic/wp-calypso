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
				icon={ <img src="/calypso/images/upgrades/word-ads.svg" /> }
				title={ translate( 'Easily monetize your site' ) }
				description={ translate(
					'Take advantage of WordAds instant activation on your upgraded site. ' +
						'WordAds lets you earn money by displaying promotional content.'
				) }
				buttonText={ translate( 'Start earning' ) }
				href={ '/ads/settings/' + selectedSite.slug }
			/>
		</div>
	);
} );
