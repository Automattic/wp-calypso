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
				title={ translate( 'Search (Beta)' ) }
				description={ translate(
					'Replace the default WordPress search with better results ' +
						'that will help your users find what they are looking for.'
				) }
				buttonText={ translate( 'Configure Search' ) }
				href={ '/settings/traffic/' + selectedSite.slug }
			/>
		</div>
	);
} );
