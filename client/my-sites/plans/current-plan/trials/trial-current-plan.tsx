import { recordTracksEvent } from '@automattic/calypso-analytics';
import { PLAN_WOOEXPRESS_MEDIUM_MONTHLY } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { useMediaQuery } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useState } from 'react';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { getECommerceTrialCheckoutUrl } from 'calypso/lib/trials/get-ecommerce-trial-checkout-url';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import ECommerceTrialBanner from '../../ecommerce-trial/ecommerce-trial-banner';
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

	const isMobile = useMediaQuery( '(max-width: 480px)' );
	const displayAllIncluded = ! isMobile || showAllTrialFeaturesInMobileView;

	const targetPlan = PLAN_WOOEXPRESS_MEDIUM_MONTHLY;

	/**
	 * Redirects to the checkout page with Plan on cart.
	 *
	 * @param ctaPosition - The position of the CTA that triggered the redirect.
	 */
	const goToCheckoutWithPlan = ( ctaPosition: string ) => {
		recordTracksEvent( `calypso_wooexpress_my_plan_cta`, {
			cta_position: ctaPosition,
		} );

		const checkoutUrl = getECommerceTrialCheckoutUrl( {
			productSlug: targetPlan,
			siteSlug: selectedSite?.slug ?? '',
		} );

		page.redirect( checkoutUrl );
	};

	const bannerCallToAction = (
		<Button
			className="e-commerce-trial-current-plan__trial-card-cta"
			primary
			onClick={ () => goToCheckoutWithPlan( 'card' ) }
		>
			{ translate( 'Upgrade now' ) }
		</Button>
	);

	return (
		<>
			<BodySectionCssClass bodyClass={ [ 'is-ecommerce-trial-plan' ] } />

			<div className="e-commerce-trial-current-plan__banner-wrapper">
				<ECommerceTrialBanner callToAction={ bannerCallToAction } />
			</div>

			<h2 className="e-commerce-trial-current-plan__section-title">
				{ translate( 'What’s included in your free trial' ) }
			</h2>
			<div className="e-commerce-trial-current-plan__included-wrapper">
				<EcommerceTrialIncluded displayAll={ displayAllIncluded } />

				{ ! displayAllIncluded && (
					<Button
						className="e-commerce-trial-current-plan__included-view-all"
						onClick={ viewAllIncludedFeatures }
					>
						{ translate( 'View all' ) }
					</Button>
				) }
			</div>

			<h2 className="e-commerce-trial-current-plan__section-title">
				{ translate( 'Ready to start selling?' ) }
			</h2>
			<p className="e-commerce-trial-current-plan__section-subtitle">
				{ translate(
					'Upgrade your free trial to launch your store and get the next-level features you need to grow.'
				) }
			</p>

			<div className="e-commerce-trial-current-plan__more-wrapper">
				<EcommerceTrialNotIncluded />
			</div>

			<div className="e-commerce-trial-current-plan__cta-wrapper">
				<Button
					className="e-commerce-trial-current-plan__cta is-primary"
					onClick={ () => goToCheckoutWithPlan( 'footer' ) }
				>
					{ translate( 'Upgrade now' ) }
				</Button>
			</div>
		</>
	);
};

export default TrialCurrentPlan;
