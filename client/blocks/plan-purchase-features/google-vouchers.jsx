/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import GoogleVoucherDetails from 'my-sites/upgrades/checkout-thank-you/google-voucher';
import QuerySiteVouchers from 'components/data/query-site-vouchers';

export default ( { selectedSite } ) => {
	return (
		<div className="plan-purchase-features__item">
			<QuerySiteVouchers siteId={ selectedSite.ID } />
			<GoogleVoucherDetails selectedSite={ selectedSite } />
		</div>
	);
};
