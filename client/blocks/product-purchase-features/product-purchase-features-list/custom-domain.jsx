/**
 * External dependencies
 */
import React from 'react';
import pick from 'lodash/pick';

/**
 * Internal dependencies
 */
import CustomDomainPurchaseDetail from 'my-sites/upgrades/checkout-thank-you/custom-domain-purchase-detail';

export default ( props ) => {
	return (
		<div className="product-purchase-features-list__item">
			<CustomDomainPurchaseDetail { ...pick( props, [ 'selectedSite', 'hasDomainCredit' ] ) } />
		</div>
	);
};
