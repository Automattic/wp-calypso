/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PurchaseDetail from 'components/purchase-detail';

/**
 * Image dependencies
 */
import googleMyBusinessImage from 'assets/images/illustrations/google-my-business-feature.svg';

export default localize( ( { selectedSite, translate } ) => {
	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				icon={ <img alt="" src={ googleMyBusinessImage } /> }
				title={ translate( 'Google My Business' ) }
				description={ translate(
					'See how customers find you on Google -- and whether they visited your site and looked for more info on your business -- by connecting to a Google My Business location.'
				) }
				buttonText={ translate( 'Connect to Google My Business' ) }
				href={ '/google-my-business/' + selectedSite.slug }
			/>
		</div>
	);
} );
