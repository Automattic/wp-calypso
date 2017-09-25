/**
 * External dependencies
 */
import { pick } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import CustomDomainPurchaseDetail from 'my-sites/checkout/checkout-thank-you/custom-domain-purchase-detail';

export default ( props ) => {
	return (
		<div className="product-purchase-features-list__item">
			<CustomDomainPurchaseDetail { ...pick( props, [ 'selectedSite', 'hasDomainCredit' ] ) } />
		</div>
	);
};
