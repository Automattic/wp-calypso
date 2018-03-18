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
				icon="plugins"
				title={ translate( 'Add a Plugin' ) }
				description={ translate(
					'Search and add plugins right from your dashboard, or upload a plugin ' +
						'from your computer with a drag-and-drop interface.'
				) }
				buttonText={ translate( 'Upload a plugin now' ) }
				href={ '/plugins/upload/' + selectedSite.slug }
			/>
		</div>
	);
} );
