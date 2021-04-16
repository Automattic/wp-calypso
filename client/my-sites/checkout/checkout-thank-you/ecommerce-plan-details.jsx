/**
 * External dependencies
 */

import { find } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import CustomDomainPurchaseDetail from './custom-domain-purchase-detail';
import GoogleAppsDetails from './google-apps-details';
import { isEnabled } from '@automattic/calypso-config';
import { isEcommerce, isGSuiteOrExtraLicenseOrGoogleWorkspace } from '@automattic/calypso-products';
import PurchaseDetail from 'calypso/components/purchase-detail';

/**
 * Image dependencies
 */
import analyticsImage from 'calypso/assets/images/illustrations/google-analytics.svg';
import conciergeImage from 'calypso/assets/images/illustrations/jetpack-concierge.svg';
import updatesImage from 'calypso/assets/images/illustrations/updates.svg';

function trackOnboardingButtonClick() {
	recordTracksEvent( 'calypso_checkout_thank_you_onboarding_click' );
}

const EcommercePlanDetails = ( { selectedSite, sitePlans, selectedFeature, purchases } ) => {
	const plan = find( sitePlans.data, isEcommerce );
	const googleAppsWasPurchased = purchases.some( isGSuiteOrExtraLicenseOrGoogleWorkspace );

	return (
		<div>
			{ googleAppsWasPurchased && <GoogleAppsDetails purchases={ purchases } /> }

			<CustomDomainPurchaseDetail
				selectedSite={ selectedSite }
				hasDomainCredit={ plan && plan.hasDomainCredit }
			/>

			<PurchaseDetail
				icon={ <img alt="" src={ conciergeImage } /> }
				title={ i18n.translate( 'Get personalized help' ) }
				description={ i18n.translate(
					'Schedule a Quick Start session with a Happiness Engineer to set up ' +
						'your site and learn more about WordPress.com.'
				) }
				buttonText={ i18n.translate( 'Schedule a session' ) }
				href={ `/me/concierge/${ selectedSite.slug }/book` }
				onClick={ trackOnboardingButtonClick }
			/>

			{ ! selectedFeature && isEnabled( 'manage/plugins/upload' ) && (
				<PurchaseDetail
					icon={ <img alt="" src={ updatesImage } /> }
					title={ i18n.translate( 'Add a Plugin' ) }
					description={ i18n.translate(
						'Search and add plugins right from your dashboard, or upload a plugin ' +
							'from your computer with a drag-and-drop interface.'
					) }
					buttonText={ i18n.translate( 'Upload a plugin now' ) }
					href={ '/plugins/manage/' + selectedSite.slug }
				/>
			) }

			<PurchaseDetail
				icon={ <img alt="" src={ analyticsImage } /> }
				title={ i18n.translate( 'Connect to Google Analytics' ) }
				description={ i18n.translate(
					"Complement WordPress.com's stats with Google's in-depth look at your visitors and traffic patterns."
				) }
				buttonText={ i18n.translate( 'Connect Google Analytics' ) }
				href={ '/settings/analytics/' + selectedSite.slug }
			/>
		</div>
	);
};

EcommercePlanDetails.propTypes = {
	selectedSite: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ).isRequired,
	selectedFeature: PropTypes.object,
	sitePlans: PropTypes.object.isRequired,
};

export default EcommercePlanDetails;
