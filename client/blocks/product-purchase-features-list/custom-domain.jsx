/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CustomDomainPurchaseDetail from 'my-sites/checkout/checkout-thank-you/custom-domain-purchase-detail';

export default function CustomDomainPurchaseDetailItem( {
	hasDomainCredit,
	isButtonPrimary,
	selectedSite,
} ) {
	return (
		<div className="product-purchase-features-list__item">
			<CustomDomainPurchaseDetail
				isButtonPrimary={ isButtonPrimary }
				selectedSite={ selectedSite }
				hasDomainCredit={ hasDomainCredit }
			/>
		</div>
	);
}
