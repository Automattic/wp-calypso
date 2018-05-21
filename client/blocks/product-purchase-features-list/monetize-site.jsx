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
	const adSettingsUrl = selectedSite.jetpack
		? '/settings/traffic/' + selectedSite.slug
		: '/ads/settings/' + selectedSite.slug;
	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				icon={ <img alt="" src="/calypso/images/illustrations/jetpack-wordads.svg" /> }
				title={ translate( 'Monetize your site with ads' ) }
				description={ translate(
					'WordAds lets you earn money by displaying promotional content. Start earning today. '
				) }
				buttonText={ translate( 'Start earning' ) }
				href={ adSettingsUrl }
			/>
		</div>
	);
} );
