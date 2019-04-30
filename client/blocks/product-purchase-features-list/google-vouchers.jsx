/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import GoogleVoucherDetails from 'my-sites/checkout/checkout-thank-you/google-voucher';
import PurchaseDetail from 'components/purchase-detail';
import QuerySiteVouchers from 'components/data/query-site-vouchers';

export default ( { selectedSite } ) => {
	const translate = useTranslate();
	return (
		<div className="product-purchase-features-list__item">
			<QuerySiteVouchers siteId={ selectedSite.ID } />
			<PurchaseDetail
				alt=""
				id="google-credits"
				icon={ <img alt="" src="/calypso/images/illustrations/google-adwords.svg" /> }
				title={ translate( 'Google Ads credit' ) }
				description={ translate(
					'Use a $100 credit with Google to bring traffic to your most important Posts and Pages.'
				) }
				body={ <GoogleVoucherDetails selectedSite={ selectedSite } /> }
			/>
		</div>
	);
};
