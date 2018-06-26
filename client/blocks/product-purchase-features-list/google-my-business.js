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
				icon={ <img alt="" src="/calypso/images/illustrations/google-my-business-feature.svg" /> }
				title={ translate( 'Google My Business' ) }
				description={ translate(
					'View how customers find your business and what action they take by connecting to a Google My Business location.'
				) }
				buttonText={ translate( 'Connect Google My Business' ) }
				href={ '/google-my-business/' + selectedSite.slug }
			/>
		</div>
	);
} );
