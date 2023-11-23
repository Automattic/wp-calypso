import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	PLAN_BUSINESS,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	PLAN_WOOEXPRESS_MEDIUM_MONTHLY,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { useMediaQuery } from '@wordpress/compose';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { getTrialCheckoutUrl } from 'calypso/lib/trials/get-trial-checkout-url';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import useOneDollarOfferTrack from '../../hooks/use-onedollar-offer-track';
import TrialBanner from '../../trials/trial-banner';
import BusinessTrialIncluded from './business-trial-included';
import EcommerceTrialIncluded from './ecommerce-trial-included';
import EcommerceTrialNotIncluded from './ecommerce-trial-not-included';

import './trial-current-plan.scss';

const TrialCurrentPlan = () => {
	const selectedSite = useSelector( ( state ) => getSelectedSite( state ) );

	const translate = useTranslate();

	const [ showAllTrialFeaturesInMobileView, setShowAllTrialFeaturesInMobileView ] =
		useState( false );

	const viewAllIncludedFeatures = () => {
		setShowAllTrialFeaturesInMobileView( true );
	};

	const currentPlanSlug = selectedSite?.plan?.product_slug ?? '';
	const isEcommerceTrial = currentPlanSlug === PLAN_ECOMMERCE_TRIAL_MONTHLY;
	// const isMigrationTrial = currentPlanSlug === PLAN_MIGRATION_TRIAL_MONTHLY;

	const isMobile = useMediaQuery( '(max-width: 480px)' );
	const displayAllIncluded = ! isMobile || showAllTrialFeaturesInMobileView;
	const bodyClass = isEcommerceTrial ? [ 'is-ecommerce-trial-plan' ] : [ 'is-business-trial-plan' ];

	const targetPlan = isEcommerceTrial ? PLAN_WOOEXPRESS_MEDIUM_MONTHLY : PLAN_BUSINESS;
	const trackEvent = isEcommerceTrial
		? 'calypso_wooexpress_my_plan_cta'
		: 'calypso_migration_my_plan_cta';

	useOneDollarOfferTrack( selectedSite?.ID, 'plans' );

	/**
	 * Redirects to the checkout page with Plan on cart.
	 * @param ctaPosition - The position of the CTA that triggered the redirect.
	 */
	const goToCheckoutWithPlan = ( ctaPosition: string ) => {
		recordTracksEvent( trackEvent, {
			cta_position: ctaPosition,
		} );

		const checkoutUrl = getTrialCheckoutUrl( {
			productSlug: targetPlan,
			siteSlug: selectedSite?.slug ?? '',
		} );

		page.redirect( checkoutUrl );
	};

	const bannerCallToAction = (
		<Button
			className="trial-current-plan__trial-card-cta"
			primary
			onClick={ () => goToCheckoutWithPlan( 'card' ) }
		>
			{ translate( 'Upgrade now' ) }
		</Button>
	);

	const includedFeatures = () => {
		if ( isEcommerceTrial ) {
			return <EcommerceTrialIncluded displayAll={ displayAllIncluded } />;
		}

		return <BusinessTrialIncluded displayAll={ displayAllIncluded } tracksContext="current_plan" />;
	};

	return (
		<>
			<BodySectionCssClass bodyClass={ bodyClass } />

			<div className="trial-current-plan__banner-wrapper">
				<TrialBanner callToAction={ bannerCallToAction } isEcommerceTrial={ isEcommerceTrial } />
			</div>

			<h2 className="trial-current-plan__section-title">
				{ translate( 'What’s included in your free trial' ) }
			</h2>
			<div className="trial-current-plan__included-wrapper">
				{ includedFeatures() }

				{ ! displayAllIncluded && (
					<Button
						className={ classnames( 'trial-current-plan__included-view-all', {
							'is-ecommerce': isEcommerceTrial,
						} ) }
						onClick={ viewAllIncludedFeatures }
					>
						{ translate( 'View all' ) }
					</Button>
				) }
			</div>

			{ isEcommerceTrial && (
				<>
					<h2 className="trial-current-plan__section-title">
						{ translate( 'Ready to start selling?' ) }
					</h2>
					<p className="trial-current-plan__section-subtitle">
						{ translate(
							'Upgrade your free trial to launch your store and get the next-level features you need to grow.'
						) }
					</p>

					<div className="trial-current-plan__more-wrapper">
						<EcommerceTrialNotIncluded />
					</div>
				</>
			) }

			<div className="trial-current-plan__cta-wrapper">
				<Button
					className="trial-current-plan__cta is-primary"
					onClick={ () => goToCheckoutWithPlan( 'footer' ) }
				>
					{ translate( 'Upgrade now' ) }
				</Button>
			</div>
		</>
	);
};

export default TrialCurrentPlan;
