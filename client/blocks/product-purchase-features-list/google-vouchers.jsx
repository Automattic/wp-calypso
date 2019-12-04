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

/**
 * Image dependencies
 */
import googleAdwordsImage from 'assets/images/illustrations/google-adwords.svg';

export default ( { selectedSite } ) => {
	const translate = useTranslate();
	return (
		<div className="product-purchase-features-list__item">
			<QuerySiteVouchers siteId={ selectedSite.ID } />
			<PurchaseDetail
				id="google-credits"
				icon={
					<img alt={ translate( 'Google AdWords Illustration' ) } src={ googleAdwordsImage } />
				}
				title={ translate( 'Google Ads credit' ) }
				description={ translate(
					'Use a %(cost)s credit with Google to bring traffic to your most important Posts and Pages.',
					{
						args: {
							cost: '$100',
						},
					}
				) }
				body={ <GoogleVoucherDetails selectedSite={ selectedSite } /> }
			/>
		</div>
	);
};
