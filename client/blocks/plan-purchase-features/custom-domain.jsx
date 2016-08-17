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
				icon="globe"
				title={ translate( 'Get your custom domain' ) }
				description={
					translate(
						"Replace your site's address, {{em}}%(siteDomain)s{{/em}}, with a custom domain. " +
						'A free domain is included with your plan.',
						{
							args: { siteDomain: selectedSite.slug },
							components: { em: <em /> }
						}
					)
				}
				buttonText={ translate( 'Claim your free domain' ) }
				href={ '/domains/add/' + selectedSite.slug }
			/>
		</div>
	);
} );
