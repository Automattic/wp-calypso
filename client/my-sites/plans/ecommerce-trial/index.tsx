import { recordTracksEvent } from '@automattic/calypso-analytics';
import { plansLink } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo } from 'react';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import ECommercePlanFeatures from 'calypso/my-sites/plans/components/ecommerce-plan-features';
import ECommerceTrialBanner from './ecommerce-trial-banner';
import { getWooExpressMediumFeatureSets } from './wx-medium-features';

import './style.scss';

interface ECommerceTrialPlansPageProps {
	interval?: 'monthly' | 'yearly';
	siteSlug: string;
}

const ECommerceTrialPlansPage = ( props: ECommerceTrialPlansPageProps ) => {
	const interval = props.interval ?? 'monthly';
	const siteSlug = props.siteSlug;

	const translate = useTranslate();

	const triggerTracksEvent = useCallback( ( tracksLocation: string ) => {
		recordTracksEvent( 'calypso_wooexpress_plans_page_upgrade_cta_clicked', {
			location: tracksLocation,
		} );
	}, [] );

	// WX Medium and Commerce have the same features
	const wooExpressMediumPlanFeatureSets = useMemo( () => {
		return getWooExpressMediumFeatureSets( { translate } );
	}, [ translate ] );

	return (
		<>
			<BodySectionCssClass bodyClass={ [ 'is-ecommerce-trial-plan' ] } />

			<div className="e-commerce-trial-plans__banner-wrapper">
				<ECommerceTrialBanner />
			</div>

			<ECommercePlanFeatures
				interval={ interval }
				monthlyControlProps={ { path: plansLink( '/plans', siteSlug, 'monthly', true ) } }
				planFeatureSets={ wooExpressMediumPlanFeatureSets }
				siteSlug={ siteSlug }
				triggerTracksEvent={ triggerTracksEvent }
				yearlyControlProps={ { path: plansLink( '/plans', siteSlug, 'yearly', true ) } }
			/>
		</>
	);
};

export default ECommerceTrialPlansPage;
