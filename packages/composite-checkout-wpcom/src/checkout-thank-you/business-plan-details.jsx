/**
 * External dependencies
 */

import { find } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect, useSelector } from 'react-redux';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'lib/analytics/tracks';
import CustomDomainPurchaseDetail from './custom-domain-purchase-detail';
import GoogleAppsDetails from './google-apps-details';
import { isEnabled } from 'config';
import { isBusiness, isGoogleApps } from 'lib/products-values';
import PurchaseDetail from 'components/purchase-detail';
import isJetpackSectionEnabledForSite from 'state/selectors/is-jetpack-section-enabled-for-site';
import QueryProductsList from 'components/data/query-products-list';
import { getProductsList, getProductDisplayCost } from 'state/products-list/selectors';

/**
 * Image dependencies
 */
import analyticsImage from 'assets/images/illustrations/google-analytics.svg';
import conciergeImage from 'assets/images/illustrations/jetpack-concierge.svg';
import jetpackBackupImage from 'assets/images/illustrations/jetpack-backup.svg';
import themeImage from 'assets/images/illustrations/themes.svg';
import updatesImage from 'assets/images/illustrations/updates.svg';

function trackOnboardingButtonClick() {
	recordTracksEvent( 'calypso_checkout_thank_you_onboarding_click' );
}

const BusinessPlanDetails = ( {
	selectedSite,
	sitePlans,
	selectedFeature,
	purchases,
	hasProductsList,
	conciergeSessionDisplayCost,
} ) => {
	const shouldPromoteJetpack = useSelector( ( state ) =>
		isJetpackSectionEnabledForSite( state, selectedSite?.ID )
	);

	const plan = find( sitePlans.data, isBusiness );
	const googleAppsWasPurchased = purchases.some( isGoogleApps );

	const locale = i18n.getLocaleSlug();
	const isEnglish = -1 !== [ 'en', 'en-gb' ].indexOf( locale );

	const detailDescriptionWithPrice = i18n.translate(
		'Schedule a %(price)s Quick Start session with a Happiness Engineer to set up your site and learn more about WordPress.com.',
		{
			args: {
				price: conciergeSessionDisplayCost,
			},
		}
	);

	//TODO: remove this once price translations are finished and just use detailDescriptionWithPrice.
	let detailDescription = i18n.translate(
		'Schedule a Quick Start session with a Happiness Engineer to set up your site and learn more about WordPress.com.'
	);

	if (
		isEnglish ||
		i18n.hasTranslation(
			'Schedule a %(price)s Quick Start session with a Happiness Engineer to set up your site and learn more about WordPress.com.'
		)
	) {
		detailDescription = detailDescriptionWithPrice;
	}

	return (
		<div>
			{ googleAppsWasPurchased && <GoogleAppsDetails purchases={ purchases } /> }
			{ ! hasProductsList && <QueryProductsList /> }
			{ shouldPromoteJetpack && (
				<PurchaseDetail
					icon={ <img alt="" src={ jetpackBackupImage } /> }
					title={ i18n.translate( 'Check your backups' ) }
					description={ i18n.translate(
						'Backup gives you granular control over your site, with the ability to restore it to any previous state, and export it at any time.'
					) }
					buttonText={ i18n.translate( 'See the latest backup' ) }
					href={ `/backup/${ selectedSite.slug }` }
					onClick={ trackOnboardingButtonClick }
				/>
			) }

			<CustomDomainPurchaseDetail
				selectedSite={ selectedSite }
				hasDomainCredit={ plan && plan.hasDomainCredit }
			/>

			{ ( isEnglish || i18n.hasTranslation( 'Purchase a session' ) ) && (
				<PurchaseDetail
					icon={ <img alt="" src={ conciergeImage } /> }
					title={ i18n.translate( 'Get personalized help' ) }
					description={ detailDescription }
					buttonText={ i18n.translate( 'Purchase a session' ) }
					href={ `/checkout/offer-quickstart-session` }
					onClick={ trackOnboardingButtonClick }
				/>
			) }

			{ ! selectedFeature && (
				<PurchaseDetail
					icon={ <img alt="" src={ themeImage } /> }
					title={ i18n.translate( 'Try a New Theme' ) }
					description={ i18n.translate(
						"You've now got access to every premium theme, at no extra cost - that's hundreds of new options. " +
							'Give one a try!'
					) }
					buttonText={ i18n.translate( 'Browse premium themes' ) }
					href={ '/themes/' + selectedSite.slug }
				/>
			) }

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

BusinessPlanDetails.propTypes = {
	selectedSite: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ).isRequired,
	selectedFeature: PropTypes.object,
	sitePlans: PropTypes.object.isRequired,
};
export default connect( ( state ) => {
	const productsList = getProductsList( state );
	return {
		hasProductsList: Object.keys( productsList ).length > 0,
		conciergeSessionDisplayCost: getProductDisplayCost( state, 'concierge-session' ),
	};
} )( BusinessPlanDetails );
