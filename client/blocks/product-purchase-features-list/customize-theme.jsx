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
import { isEnabled } from 'config';

function isCustomizeEnabled() {
	return isEnabled( 'manage/customize' );
}

function getCustomizeLink( selectedSite ) {
	const adminUrl = selectedSite.URL + '/wp-admin/',
		customizerInAdmin =
			adminUrl + 'customize.php?return=' + encodeURIComponent( window.location.href );

	return isCustomizeEnabled() ? '/customize/' + selectedSite.slug : customizerInAdmin;
}

export default localize( ( { selectedSite, translate } ) => {
	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				icon={ <img alt="" src="/calypso/images/illustrations/jetpack-dashboard.svg" /> }
				title={ translate( 'Advanced customization' ) }
				description={ translate(
					"Change your site's appearance in a few clicks, with an expanded " +
						'selection of fonts and colors, and access to custom CSS.'
				) }
				buttonText={ translate( 'Start customizing' ) }
				href={ getCustomizeLink( selectedSite ) }
				target={ isCustomizeEnabled() ? undefined : '_blank' }
			/>
		</div>
	);
} );
