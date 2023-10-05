import { recordTracksEvent } from '@automattic/calypso-analytics';
import { plansLink } from '@automattic/calypso-products';
import { useCallback } from 'react';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import useOneDollarOfferTrack from '../hooks/use-onedollar-offer-track';
import TrialBanner from '../trials/trial-banner';
import { WooExpressPlans } from './wooexpress-plans';
import type { Site } from 'calypso/my-sites/scan/types';
import './style.scss';

interface ECommerceTrialPlansPageProps {
	interval?: 'monthly' | 'yearly';
	site: Site;
}

const ECommerceTrialPlansPage = ( props: ECommerceTrialPlansPageProps ) => {
	const interval = props.interval ?? 'monthly';
	const siteSlug = props.site?.slug;
	const siteId = props.site?.ID;

	const triggerPlansGridTracksEvent = useCallback( ( planSlug: string ) => {
		recordTracksEvent( 'calypso_wooexpress_plans_page_upgrade_cta_clicked', {
			location: 'plans_grid',
			plan_slug: planSlug,
		} );
	}, [] );

	useOneDollarOfferTrack( siteId, 'plans' );

	return (
		<>
			<BodySectionCssClass bodyClass={ [ 'is-ecommerce-trial-plan' ] } />

			<div className="e-commerce-trial-plans__banner-wrapper">
				<TrialBanner isEcommerceTrial={ true } />
			</div>

			<WooExpressPlans
				siteId={ siteId }
				siteSlug={ siteSlug }
				interval={ interval }
				yearlyControlProps={ { path: plansLink( '/plans', siteSlug, 'yearly', true ) } }
				monthlyControlProps={ { path: plansLink( '/plans', siteSlug, 'monthly', true ) } }
				showIntervalToggle={ true }
				triggerTracksEvent={ triggerPlansGridTracksEvent }
			/>
		</>
	);
};

export default ECommerceTrialPlansPage;
