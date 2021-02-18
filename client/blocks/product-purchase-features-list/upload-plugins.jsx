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
import updatesImage from 'calypso/assets/images/illustrations/updates.svg';

export default localize( ( { selectedSite, translate } ) => {
	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				icon={ <img alt="" src={ updatesImage } /> }
				title={ translate( 'Add a Plugin' ) }
				description={ translate(
					'Search and add plugins right from your dashboard, or upload a plugin ' +
						'from your computer with a drag-and-drop interface.'
				) }
				buttonText={ translate( 'Upload a plugin now' ) }
				href={ '/plugins/manage/' + selectedSite.slug }
			/>
		</div>
	);
} );
