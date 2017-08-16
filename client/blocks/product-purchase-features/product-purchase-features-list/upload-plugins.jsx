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
				title={ translate( 'Upload a Plugin' ) }
				description={ translate(
					'You can now upload your own plugins, or ones you\'ve downloaded, directly through a drag and drop interface.'
				) }
				buttonText={ translate( 'Upload a plugin now' ) }
				href={ '/plugins/upload/' + selectedSite.slug }
			/>
		</div>
	);
} );
