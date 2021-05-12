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
import googleMyBusinessImage from 'calypso/assets/images/illustrations/google-my-business-feature.svg';

export default localize( ( { selectedSite, translate } ) => {
	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				icon={ <img alt="" src={ googleMyBusinessImage } /> }
				title={ translate( 'Google My Business' ) }
				description={ translate(
					'Create a Google business listing, connect with customers, and discover how customers find you on Google by connecting to a Google My Business location.'
				) }
				buttonText={ translate( 'Connect to Google My Business' ) }
				href={ '/google-my-business/' + selectedSite.slug }
			/>
		</div>
	);
} );
