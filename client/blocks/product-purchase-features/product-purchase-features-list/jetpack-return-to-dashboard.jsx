/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import PurchaseDetail from 'components/purchase-detail';
import { untrailingslashit } from 'lib/route';

export default localize( ( { selectedSite, translate } ) => {
	let adminURL = get( selectedSite, 'options.admin_url', '' );
	if ( adminURL ) {
		adminURL = untrailingslashit( adminURL ) + '/admin.php?page=jetpack';
	}

	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				icon="house"
				title={ translate( 'Return to your dashboard' ) }
				buttonText={ translate( 'Go back to %(site)s', { args: { site: selectedSite.name } } ) }
				href={ adminURL }
			/>
		</div>
	);
} );
