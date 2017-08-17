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
				icon="customize"
				title={ translate( 'Try a New Theme' ) }
				description={ translate(
					'You\'ve now got access to every premium theme, at no extra cost - that\'s hundreds of new options.'
				) }
				buttonText={ translate( 'Give one a try!' ) }
				href={ '/themes/' + selectedSite.slug }
			/>
		</div>
	);
} );
