/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import GoogleVoucherDetails from 'client/my-sites/checkout/checkout-thank-you/google-voucher';
import QuerySiteVouchers from 'client/components/data/query-site-vouchers';

export default ( { selectedSite } ) => {
	return (
		<div className="product-purchase-features-list__item">
			<QuerySiteVouchers siteId={ selectedSite.ID } />
			<GoogleVoucherDetails selectedSite={ selectedSite } />
		</div>
	);
};
