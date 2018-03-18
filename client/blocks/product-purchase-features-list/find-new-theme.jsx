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
				icon={ <img alt="" src="/calypso/images/upgrades/customize-theme.svg" /> }
				title={ translate( 'Try a New Theme' ) }
				description={ translate(
					"You've now got access to every premium theme, at no extra cost - that's hundreds of new options. Give one a try!"
				) }
				buttonText={ translate( 'Browse premium themes' ) }
				href={ '/themes/' + selectedSite.slug }
			/>
		</div>
	);
} );
