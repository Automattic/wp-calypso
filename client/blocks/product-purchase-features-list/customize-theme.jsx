/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PurchaseDetail from 'calypso/components/purchase-detail';

/**
 * Image dependencies
 */
import customizeImage from 'calypso/assets/images/illustrations/dashboard.svg';

function getCustomizeLink( selectedSite ) {
	return '/customize/' + selectedSite.slug;
}

export default localize( ( { selectedSite, translate } ) => {
	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				icon={ <img alt="" src={ customizeImage } /> }
				title={ translate( 'Advanced customization' ) }
				description={ translate(
					"Change your site's appearance in a few clicks, with an expanded " +
						'selection of fonts and colors.'
				) }
				buttonText={ translate( 'Start customizing' ) }
				href={ getCustomizeLink( selectedSite ) }
			/>
		</div>
	);
} );
