/**
 * External dependencies
 */

import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PurchaseDetail from 'calypso/components/purchase-detail';

/**
 * Image dependencies
 */
import customizeImage from 'calypso/assets/images/illustrations/dashboard.svg';

function getEditCSSLink( selectedSite ) {
	return '/customize/custom-css/' + selectedSite.slug;
}

export default function CustomCSS( { selectedSite } ) {
	const translate = useTranslate();
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
			/>
		</div>
	);
}
