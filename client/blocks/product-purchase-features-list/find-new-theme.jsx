/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PurchaseDetail from 'components/purchase-detail';

/**
 * Image dependencies
 */
import premiumThemesImage from 'assets/images/illustrations/themes.svg';

export default localize( ( { selectedSite, translate } ) => {
	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				icon={ <img alt="" src={ premiumThemesImage } /> }
				title={ translate( 'Try a premium theme' ) }
				description={ translate(
					'Access hundreds of beautifully designed premium themes at no extra cost.'
				) }
				buttonText={ translate( 'Browse premium themes' ) }
				href={ '/themes/' + selectedSite.slug }
			/>
		</div>
	);
} );
