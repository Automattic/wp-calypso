/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import { get, noop } from 'lodash';
import { untrailingslashit } from 'lib/route';

/**
 * Internal dependencies
 */
import PurchaseDetail from 'components/purchase-detail';

export default localize( ( { selectedSite, translate, onClick = noop } ) => {
	let adminURL = get( selectedSite, 'options.admin_url', '' );
	if ( adminURL ) {
		adminURL = untrailingslashit( adminURL ) + '/admin.php?page=jetpack';
	}

	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				icon={ <img alt="" src="/calypso/images/illustrations/jetpack-dashboard.svg" /> }
				title={ translate( 'Return to your Jetpack Dashboard' ) }
				description={ translate(
					'Go back to your self-hosted WordPress site’s wp-admin Jetpack Dashboard.'
				) }
				buttonText={ translate( 'Jetpack Dashboard' ) }
				href={ adminURL }
				onClick={ onClick }
			/>
		</div>
	);
} );
