import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isEnabled } from '@automattic/calypso-config';
import {
	plansLink,
	PLAN_WOOEXPRESS_MEDIUM,
	PLAN_WOOEXPRESS_SMALL,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import ECommercePlanFeatures from 'calypso/my-sites/plans/components/ecommerce-plan-features';
import ECommerceTrialBanner from './ecommerce-trial-banner';
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

	const plansTableProps = {
		plans: [ PLAN_WOOEXPRESS_SMALL, PLAN_WOOEXPRESS_MEDIUM ],
		hidePlansFeatureComparison: true,
		siteId,
	};

	const multiPlanFeatures = (
		<div className="is-2023-pricing-grid">
			<AsyncLoad require="calypso/my-sites/plan-features-2023-grid" { ...plansTableProps } />
		</div>
	);

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
