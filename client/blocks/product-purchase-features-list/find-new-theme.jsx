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
				title={ translate( 'Premium themes' ) }
				description={ translate(
					'Access hundreds of beautifully designed premium themes at no extra cost.'
				) }
				buttonText={ translate( 'Browse premium themes' ) }
				href={ '/themes/' + selectedSite.slug }
			/>
		</div>
	);
} );
