/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CustomDomainPurchaseDetail from 'calypso/my-sites/checkout/checkout-thank-you/custom-domain-purchase-detail';

export default function CustomDomainPurchaseDetailItem( {
	hasDomainCredit,
	selectedSite,
	onlyBlogDomain,
} ) {
	return (
		<div className="product-purchase-features-list__item">
			<CustomDomainPurchaseDetail
				selectedSite={ selectedSite }
				hasDomainCredit={ hasDomainCredit }
				onlyBlogDomain={ onlyBlogDomain }
			/>
		</div>
	);
}
