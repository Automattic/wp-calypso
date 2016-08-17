/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PurchaseDetail from 'components/purchase-detail';

export default localize( ( { customizeLink, isCustomizeEnabled, translate } ) => {
	return (
		<div className="plan-purchase-features__item">
			<PurchaseDetail
				icon="customize"
				title={ translate( 'Customize your theme' ) }
				description={
					translate(
						"You now have direct control over your site's fonts and colors in the customizer. " +
						"Change your site's entire look in a few clicks."
					)
				}
				buttonText={ translate( 'Start customizing' ) }
				href={ customizeLink }
				target={ isCustomizeEnabled ? undefined : '_blank' }
			/>
		</div>
	);
} );
