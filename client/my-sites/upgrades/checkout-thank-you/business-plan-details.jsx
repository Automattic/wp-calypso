/**
 * External dependencies
 */
import find from 'lodash/find';
import React from 'react';

/**
 * Internal dependencies
 */
import CustomDomainPurchaseDetail from './custom-domain-purchase-detail';
import GoogleVoucherDetails from './google-voucher-details';
import i18n from 'lib/mixins/i18n';
import { isBusiness } from 'lib/products-values';
import PurchaseDetail from 'components/purchase-detail';
import QuerySiteVouchers from 'components/data/query-site-vouchers';

const BusinessPlanDetails = ( { selectedSite, sitePlans, selectedFeature } ) => {
	const plan = find( sitePlans.data, isBusiness );

	return (
		<div>
			<QuerySiteVouchers siteId={ selectedSite.ID } />

			{ plan.hasDomainCredit && <CustomDomainPurchaseDetail selectedSite={ selectedSite } /> }

			{ ! selectedFeature &&
				<PurchaseDetail
					icon="customize"
					title={ i18n.translate( 'Find a new theme' ) }
					description={ i18n.translate( 'All our premium themes are now available at no extra cost. Try them out now.' ) }
					buttonText={ i18n.translate( 'Browse premium themes' ) }
					href={ '/design/' + selectedSite.slug } />
			}

			<GoogleVoucherDetails selectedSite={ selectedSite } />

			<PurchaseDetail
				icon="stats-alt"
				title={ i18n.translate( 'Stats from Google Analytics' ) }
				description={ i18n.translate( 'Connect to Google Analytics for the perfect complement to WordPress.com stats.' ) }
				buttonText={ i18n.translate( 'Connect Google Analytics' ) }
				href={ '/settings/analytics/' + selectedSite.slug } />
		</div>
	);
};

BusinessPlanDetails.propTypes = {
	selectedSite: React.PropTypes.oneOfType( [
		React.PropTypes.bool,
		React.PropTypes.object
	] ).isRequired,
	selectedFeature: React.PropTypes.object,
	sitePlans: React.PropTypes.object.isRequired
};

export default BusinessPlanDetails;
