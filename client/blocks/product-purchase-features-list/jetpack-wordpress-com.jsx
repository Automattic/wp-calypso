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
				icon="plugins"
				title={ translate( 'Automatic Updates' ) }
				description={ translate(
					'Keep your plugins securely updated and manage your site from ' +
						'{{a}}mobile apps{{/a}}.',
					{
						components: {
							a: <a href="https://apps.wordpress.com/" />,
						},
					}
				) }
				buttonText={ translate( 'Configure auto updates' ) }
				href={ `/plugins/manage/${ selectedSite.slug }` }
			/>
		</div>
	);
} );
