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
				icon="search"
				title={ translate( 'Search' ) }
				description={ translate(
					'Replace the default WordPress search with better results ' +
						'and filtering that will help your users find what they are looking for.'
				) }
				buttonText={ translate( 'Enable Search in Traffic Settings' ) }
				href={ '/settings/traffic/' + selectedSite.slug }
			/>
		</div>
	);
} );
