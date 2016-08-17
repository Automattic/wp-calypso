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
		<div className="plan-purchase-features__item">
			<PurchaseDetail
				icon="customize"
				title={ translate( 'Find a new theme' ) }
				description={ translate( 'All our premium themes are now available at no extra cost. Try them out now.' ) }
				buttonText={ translate( 'Browse premium themes' ) }
				href={ '/design/' + selectedSite.slug }
			/>
		</div>
	);
} );
