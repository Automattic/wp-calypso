import { recordTracksEvent } from '@automattic/calypso-analytics';
import { PLAN_ECOMMERCE_MONTHLY } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { useMediaQuery } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import ECommerceTrialBanner from '../../ecommerce-trial/ecommerce-trial-banner';
import FeatureIncludedCard from '../feature-included-card';
import FeatureNotIncludedCard from '../feature-not-included-card';
import { includedFeatures, notIncludedFeatures } from './trial-features';
import type { GetFeatureHrefProps } from './trial-features';

import './style.scss';

const ECommerceTrialCurrentPlan = () => {
	const selectedSite = useSelector( ( state ) => getSelectedSite( state ) );

	const translate = useTranslate();

	const [ showAllTrialFeaturesInMobileView, setShowAllTrialFeaturesInMobileView ] =
		useState( false );

	const viewAllIncludedFeatures = () => {
		setShowAllTrialFeaturesInMobileView( true );

		recordTracksEvent( 'calypso_wooexpress_my_plan_view_all_features_click' );
	};

	const isMobile = useMediaQuery( '(max-width: 480px)' );
	const displayAllIncluded = ! isMobile || showAllTrialFeaturesInMobileView;

	/**
	 * Redirects to the checkout page with the ecommerce plan.
	 *
	 * @param ctaPosition - The position of the CTA that triggered the redirect.
	 */
	const goToCheckoutWithEcommercePlan = ( ctaPosition: string ) => {
		recordTracksEvent( `calypso_wooexpress_my_plan_cta`, {
			cta_position: ctaPosition,
		} );
		page.redirect( `/checkout/${ selectedSite?.slug }/${ PLAN_ECOMMERCE_MONTHLY }` );
	};

	const allIncludedFeatures = useMemo( () => includedFeatures( { translate } ), [ translate ] );

	const whatsIncluded = displayAllIncluded
		? allIncludedFeatures
		: // Show only first 4 items
		  allIncludedFeatures.slice( 0, 4 );

	const whatsNotIncluded = useMemo( () => notIncludedFeatures( { translate } ), [ translate ] );

	const bannerCallToAction = (
		<Button
			className="e-commerce-trial-current-plan__trial-card-cta"
			primary
			onClick={ () => goToCheckoutWithEcommercePlan( 'card' ) }
		>
			{ translate( 'Upgrade now' ) }
		</Button>
	);

	const siteUrlDetails = useMemo( (): GetFeatureHrefProps => {
		return {
			siteSlug: selectedSite?.slug ?? '',
			wpAdminUrl:
				selectedSite?.options?.admin_url ??
				( selectedSite?.URL ? selectedSite.URL + '/wp-admin/' : '' ),
		};
	}, [ selectedSite ] );

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
				{ whatsIncluded.map( ( feature ) => (
					<FeatureIncludedCard
						key={ feature.id }
						{ ...feature }
						{ ...siteUrlDetails }
					></FeatureIncludedCard>
				) ) }

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
				{ whatsNotIncluded.map( ( feature ) => (
					<FeatureNotIncludedCard
						key={ feature.title }
						illustration={ feature.illustration }
						title={ feature.title }
						text={ feature.text }
					></FeatureNotIncludedCard>
				) ) }
			</div>

			<div className="e-commerce-trial-current-plan__cta-wrapper">
				<Button
					className="e-commerce-trial-current-plan__cta is-primary"
					onClick={ () => goToCheckoutWithEcommercePlan( 'footer' ) }
				>
					{ translate( 'Upgrade now' ) }
				</Button>
			</div>
		</>
	);
};

export default ECommerceTrialCurrentPlan;
