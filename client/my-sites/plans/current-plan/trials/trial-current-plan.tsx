import { PLAN_ECOMMERCE_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { useMediaQuery } from '@wordpress/compose';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { useSelector } from 'calypso/state';
import { getSelectedPurchase, getSelectedSite } from 'calypso/state/ui/selectors';
import UpgradeButton from '../../components/upgrade-button/upgrade-button';
import useOneDollarOfferTrack from '../../hooks/use-onedollar-offer-track';
import TrialBanner from '../../trials/trial-banner';
import BusinessTrialIncluded from './business-trial-included';
import EcommerceTrialIncluded from './ecommerce-trial-included';
import EcommerceTrialNotIncluded from './ecommerce-trial-not-included';
import './trial-current-plan.scss';
import useGoToCheckoutWithPlan from './use-go-to-checkout-with-plan';

const TrialCurrentPlan = () => {
	const selectedSite = useSelector( getSelectedSite );

	const translate = useTranslate();

	const [ showAllTrialFeaturesInMobileView, setShowAllTrialFeaturesInMobileView ] =
		useState( false );

	const viewAllIncludedFeatures = () => {
		setShowAllTrialFeaturesInMobileView( true );
	};

	const currentPlanSlug = selectedSite?.plan?.product_slug ?? '';
	const isEcommerceTrial = currentPlanSlug === PLAN_ECOMMERCE_TRIAL_MONTHLY;
	const purchase = useSelector( getSelectedPurchase );
	// const isMigrationTrial = currentPlanSlug === PLAN_MIGRATION_TRIAL_MONTHLY;

	const isMobile = useMediaQuery( '(max-width: 480px)' );
	const displayAllIncluded = ! isMobile || showAllTrialFeaturesInMobileView;
	const bodyClass = isEcommerceTrial ? [ 'is-ecommerce-trial-plan' ] : [ 'is-business-trial-plan' ];
	const isWooExpressTrial = purchase?.isWooExpressTrial;

	useOneDollarOfferTrack( selectedSite?.ID, 'plans' );

	/**
	 * Redirects to the checkout page with Plan on cart.
	 * @param ctaPosition - The position of the CTA that triggered the redirect.
	 */
	const goToCheckoutWithPlan = useGoToCheckoutWithPlan();

	const includedFeatures = () => {
		if ( isEcommerceTrial ) {
			return (
				<EcommerceTrialIncluded
					displayAll={ displayAllIncluded }
					isWooExpressTrial={ isWooExpressTrial }
				/>
			);
		}

		return <BusinessTrialIncluded displayAll={ displayAllIncluded } tracksContext="current_plan" />;
	};

	return (
		<>
			<BodySectionCssClass bodyClass={ bodyClass } />

			<div className="trial-current-plan__banner-wrapper">
				<TrialBanner
					callToAction={ <UpgradeButton goToCheckoutWithPlan={ goToCheckoutWithPlan } /> }
					isWooExpressTrial={ isWooExpressTrial }
				/>
			</div>

			<h2 className="trial-current-plan__section-title">
				{ translate( 'What’s included in your free trial' ) }
			</h2>
			<div className="trial-current-plan__included-wrapper">
				{ includedFeatures() }

				{ ! displayAllIncluded && (
					<Button
						className={ clsx( 'trial-current-plan__included-view-all', {
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
