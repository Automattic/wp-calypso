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
		<div className="plan-purchase-features__item">
			<PurchaseDetail
				icon="speaker"
				title={ translate( 'Easily monetize your site' ) }
				description={
					translate(
						'Take advantage of WordAds instant activation on your upgraded site. ' +
						'WordAds lets you earn money by displaying promotional content.'
					)
				}
				buttonText={ translate( 'Start Earning' ) }
				href={ '/ads/settings/' + selectedSite.slug }
			/>
		</div>
	);
} );
