import { recordTracksEvent } from '@automattic/calypso-analytics';
import { plansLink } from '@automattic/calypso-products';
import clsx from 'clsx';
import { useCallback } from 'react';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import UpgradeButton from '../components/upgrade-button/upgrade-button';
import useGoToCheckoutWithPlan from '../current-plan/trials/use-go-to-checkout-with-plan';
import useOneDollarOfferTrack from '../hooks/use-onedollar-offer-track';
import TrialBanner from '../trials/trial-banner';
import { EntrepreneurPlan } from './entrepreneur-plan/entrepreneur-plan';
import { WooExpressPlans } from './wooexpress-plans';
import type { Site } from 'calypso/my-sites/scan/types';
import './style.scss';

interface ECommerceTrialPlansPageProps {
	interval?: 'monthly' | 'yearly';
	site: Site;
	isWooExpressTrial: boolean;
}

const ECommerceTrialPlansPage = ( props: ECommerceTrialPlansPageProps ) => {
	const interval = props.interval ?? 'monthly';
	const siteSlug = props.site?.slug;
	const siteId = props.site?.ID;
	const { isWooExpressTrial } = props;
	const isEntrepreneurTrial = ! isWooExpressTrial;

	const triggerPlansGridTracksEvent = useCallback( ( planSlug: string ) => {
		recordTracksEvent( 'calypso_wooexpress_plans_page_upgrade_cta_clicked', {
			location: 'plans_grid',
			plan_slug: planSlug,
		} );
	}, [] );

	const goToCheckoutWithPlan = useGoToCheckoutWithPlan();

	useOneDollarOfferTrack( siteId, 'plans' );

	return (
		<>
			<BodySectionCssClass bodyClass={ [ 'is-ecommerce-trial-plan' ] } />

			<div
				className={ clsx( 'e-commerce-trial-plans__banner-wrapper', {
					'reduced-margin': isEntrepreneurTrial,
				} ) }
			>
				<TrialBanner
					isWooExpressTrial={ isWooExpressTrial }
					isEntrepreneurTrial={ isEntrepreneurTrial }
					callToAction={
						isEntrepreneurTrial ? (
							<UpgradeButton
								goToCheckoutWithPlan={ goToCheckoutWithPlan }
								isEntrepreneurTrial={ isEntrepreneurTrial }
							/>
						) : null
					}
				/>
			</div>

			{ isWooExpressTrial ? (
				<WooExpressPlans
					siteId={ siteId }
					siteSlug={ siteSlug }
					interval={ interval }
					yearlyControlProps={ { path: plansLink( '/plans', siteSlug, 'yearly', true ) } }
					monthlyControlProps={ { path: plansLink( '/plans', siteSlug, 'monthly', true ) } }
					showIntervalToggle
					triggerTracksEvent={ triggerPlansGridTracksEvent }
				/>
			) : (
				<EntrepreneurPlan />
			) }
		</>
	);
};

export default ECommerceTrialPlansPage;
