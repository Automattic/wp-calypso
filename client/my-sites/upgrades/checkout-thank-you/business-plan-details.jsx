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
import support from 'lib/url/support';

function trackCoursesButtonClick() {
	analytics.tracks.recordEvent( 'calypso_checkout_thank_you_courses_click' );
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
				title={ i18n.translate( 'Attend a live course' ) }
				description={ i18n.translate( 'Register for one of our live courses led by Happiness Engineers ' +
					'to get the most out of your site.'
				) }
				buttonText={ i18n.translate( 'Register for a course' ) }
				href={ support.CALYPSO_COURSES }
				onClick={ trackCoursesButtonClick } />

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
