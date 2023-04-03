import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isEnabled } from '@automattic/calypso-config';
import { plansLink } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo } from 'react';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import ECommercePlanFeatures from 'calypso/my-sites/plans/components/ecommerce-plan-features';
import ECommerceTrialBanner from './ecommerce-trial-banner';
import { WooExpressPlans } from './wooexpress-plans';
import { getWooExpressMediumFeatureSets } from './wx-medium-features';
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

	const translate = useTranslate();

	const triggerTracksEvent = useCallback( ( tracksLocation: string ) => {
		recordTracksEvent( 'calypso_wooexpress_plans_page_upgrade_cta_clicked', {
			location: tracksLocation,
		} );
	}, [] );

	// WX Medium and Commerce have the same features
	const wooExpressMediumPlanFeatureSets = useMemo( () => {
		return getWooExpressMediumFeatureSets( { translate, interval } );
	}, [ translate, interval ] );

	const performanceOnlyFeatures = (
		<ECommercePlanFeatures
			interval={ interval }
			monthlyControlProps={ { path: plansLink( '/plans', siteSlug, 'monthly', true ) } }
			planFeatureSets={ wooExpressMediumPlanFeatureSets }
			siteSlug={ siteSlug }
			triggerTracksEvent={ triggerTracksEvent }
			yearlyControlProps={ { path: plansLink( '/plans', siteSlug, 'yearly', true ) } }
		/>
	);

	const multiPlanFeatures = <WooExpressPlans siteId={ siteId } />;

	const availablePlanFeatures = isEnabled( 'plans/wooexpress-small' )
		? multiPlanFeatures
		: performanceOnlyFeatures;

	return (
		<>
			<BodySectionCssClass bodyClass={ [ 'is-ecommerce-trial-plan' ] } />

			<div className="e-commerce-trial-plans__banner-wrapper">
				<ECommerceTrialBanner />
			</div>

			{ availablePlanFeatures }
		</>
	);
};

export default ECommerceTrialPlansPage;
