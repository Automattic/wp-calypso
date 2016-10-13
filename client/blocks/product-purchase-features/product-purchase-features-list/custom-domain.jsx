/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CustomDomainPurchaseDetail from 'my-sites/upgrades/checkout-thank-you/custom-domain-purchase-detail';

export default ( { selectedSite, hasDomainCredit } ) => {
	return (
		<div className="product-purchase-features-list__item">
			<CustomDomainPurchaseDetail
				selectedSite={ selectedSite }
				hasDomainCredit={ hasDomainCredit }
			/>
		</div>
	);
};
