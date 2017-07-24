/**
 * External dependencies
 */
import find from 'lodash/find';
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import CustomDomainPurchaseDetail from './custom-domain-purchase-detail';
import { isBusiness } from 'lib/products-values';
import PurchaseDetail from 'components/purchase-detail';

function trackOnboardingButtonClick() {
	analytics.tracks.recordEvent( 'calypso_checkout_thank_you_onboarding_click' );
}

const BusinessPlanDetails = ( { selectedSite, sitePlans, selectedFeature } ) => {
	const plan = find( sitePlans.data, isBusiness );

	return (
		<div>
			<CustomDomainPurchaseDetail
				selectedSite={ selectedSite }
				hasDomainCredit={ plan && plan.hasDomainCredit }
			/>

			<PurchaseDetail
				icon="help"
				title={ i18n.translate( 'Get personalized help' ) }
				description={ i18n.translate( 'Schedule a one-on-one orientation with a Happiness Engineer to set up ' +
					'your site and learn more about WordPress.com.'
				) }
				buttonText={ i18n.translate( 'Schedule a session' ) }
				href={ 'https://calendly.com/wordpressdotcom/wordpress-com-business-site-setup/' }
				onClick={ trackOnboardingButtonClick } />

			{ ! selectedFeature &&
				<PurchaseDetail
					icon="customize"
					title={ i18n.translate( 'Find a new theme' ) }
					description={ i18n.translate( 'All our premium themes are now available at no extra cost. Try them out now.' ) }
					buttonText={ i18n.translate( 'Browse premium themes' ) }
					href={ '/themes/' + selectedSite.slug } />
			}

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
