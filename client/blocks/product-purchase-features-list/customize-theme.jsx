/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PurchaseDetail from 'calypso/components/purchase-detail';
import { isEnabled } from '@automattic/calypso-config';

/**
 * Image dependencies
 */
import customizeImage from 'calypso/assets/images/illustrations/dashboard.svg';

function isCustomizeEnabled() {
	return isEnabled( 'manage/customize' );
}

function getCustomizeLink( selectedSite ) {
	const adminUrl = selectedSite.URL + '/wp-admin/';
	const customizerInAdmin =
		adminUrl + 'customize.php?return=' + encodeURIComponent( window.location.href );

	return isCustomizeEnabled() ? '/customize/' + selectedSite.slug : customizerInAdmin;
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
				target={ isCustomizeEnabled() ? undefined : '_blank' }
			/>
		</div>
	);
} );
