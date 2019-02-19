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
				icon={ <img alt="" src="/calypso/images/illustrations/jetpack-search.svg" /> }
				title={ translate( 'Jetpack search' ) }
				description={ translate(
					'Replace the default WordPress search with better results ' +
						'and filtering powered by Elasticsearch.'
				) }
				buttonText={ translate( 'Enable a better search' ) }
				href={ '/settings/performance/' + selectedSite.slug }
			/>
		</div>
	);
} );
