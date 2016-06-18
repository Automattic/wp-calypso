/**
 * External dependencies
 */
import find from 'lodash/find';
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CustomDomainPurchaseDetail from './custom-domain-purchase-detail';
import { isBusiness } from 'lib/products-values';
import PurchaseDetail from 'components/purchase-detail';
import { isWordpressAdCreditsEnabled } from 'lib/plans';

const BusinessPlanDetails = ( { selectedSite, sitePlans, selectedFeature } ) => {
	const plan = find( sitePlans.data, isBusiness );

	return (
		<div>
			{ plan.hasDomainCredit && <CustomDomainPurchaseDetail selectedSite={ selectedSite } /> }

			{ ! selectedFeature &&
				<PurchaseDetail
					icon="customize"
					title={ i18n.translate( 'Find a new theme' ) }
					description={ i18n.translate( 'All our premium themes are now available at no extra cost. Try them out now.' ) }
					buttonText={ i18n.translate( 'Browse premium themes' ) }
					href={ '/design/' + selectedSite.slug } />
			}

			<PurchaseDetail
				icon="stats-alt"
				title={ i18n.translate( 'Stats from Google Analytics' ) }
				description={ i18n.translate( 'Connect to Google Analytics for the perfect complement to WordPress.com stats.' ) }
				buttonText={ i18n.translate( 'Connect Google Analytics' ) }
				href={ '/settings/analytics/' + selectedSite.slug } />

			{ isWordpressAdCreditsEnabled() && <PurchaseDetail
				icon="star"
				title={ i18n.translate( 'Boost Your Audience' ) }
				description={ i18n.translate( 'Get more visitors to your most important Posts or Pages with WordAds Boost. We\'ll display an ad for your site 100,000 times (a $100 value). ' +
					'Contact us at {{a}}wordads-credit@wordpress.com{{/a}} to activate!',
					{
						components: {
							a: <a target="_blank" href="mailto:wordads-credit@automattic.com?subject=WordAds%20Credit&body=Please%20send%20my%20100%2C000%20impressions%20to%20the%20following%20URL%20on%20my%20WordPress.com%20Business%20site.%20I%20understand%20that%20the%20title%20of%20this%20page%20will%20be%20the%20headline%2C%20and%20the%20first%20few%20lines%20of%20content%20will%20be%20used%20for%20the%20body%20of%20the%20advertisement.%0A%0AURL%20TO%20PROMOTE%3A%20" />
						}
					}
				) }
				/>
			}

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
