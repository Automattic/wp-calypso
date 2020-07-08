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

/**
 * Image dependencies
 */
import customizeImage from 'assets/images/illustrations/dashboard.svg';

function isCustomizeEnabled() {
	return isEnabled( 'manage/customize' );
}

function getEditCSSLink( selectedSite ) {
	const adminUrl = selectedSite.URL + '/wp-admin/',
		customizerInAdmin =
			adminUrl +
			'customize.php?return=' +
			encodeURIComponent( window.location.href ) +
			'&section=jetpack_custom_css';

	return isCustomizeEnabled() ? '/customize/custom-css/' + selectedSite.slug : customizerInAdmin;
}

export default localize( ( { selectedSite, translate } ) => {
	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				icon={ <img alt="" src={ customizeImage } /> }
				title={ translate( 'Custom CSS' ) }
				description={ translate(
					'Enjoy more control over your site’s look and feel by writing your own CSS.'
				) }
				buttonText={ translate( 'Edit CSS' ) }
				href={ getEditCSSLink( selectedSite ) }
				target={ isCustomizeEnabled() ? undefined : '_blank' }
			/>
		</div>
	);
} );
