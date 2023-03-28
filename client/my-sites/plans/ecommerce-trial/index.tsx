import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isEnabled } from '@automattic/calypso-config';
import { getPlans, plansLink, PLAN_WOOEXPRESS_MEDIUM } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo } from 'react';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { getPlanFeaturesObject } from 'calypso/lib/plans/features-list';
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
		return getWooExpressMediumFeatureSets( { translate, interval } );
	}, [ translate, interval ] );

	const performanceOnlyOption = (
		<ECommercePlanFeatures
			interval={ interval }
			monthlyControlProps={ { path: plansLink( '/plans', siteSlug, 'monthly', true ) } }
			planFeatureSets={ wooExpressMediumPlanFeatureSets }
			siteSlug={ siteSlug }
			triggerTracksEvent={ triggerTracksEvent }
			yearlyControlProps={ { path: plansLink( '/plans', siteSlug, 'yearly', true ) } }
		/>
	);

	const mediumPlan = getPlans()[ PLAN_WOOEXPRESS_MEDIUM ];
	// const smallPlan = getPlans()[ PLAN_WOOEXPRESS_SMALL ];
	const mediumFeaturesRaw = [
		...( mediumPlan?.getInferiorFeatures?.() || [] ),
		...( mediumPlan?.getIncludedFeatures?.() || [] ),
	];
	const mediumFeatureList = getPlanFeaturesObject( mediumFeaturesRaw ).map( ( f, i ) => ( {
		feature: mediumFeaturesRaw?.[ i ],
		title: f?.getTitle?.(),
		description: f?.getDescription?.(),
	} ) );

	const performanceAndEssentialOption = (
		<table>
			<tr>
				<td>Performance</td>
			</tr>
			{ mediumFeatureList.map( ( item ) => {
				return (
					<tr>
						<td>{ item?.title || item?.feature }</td>
					</tr>
				);
			} ) }
		</table>
	);

	const upgradeOptions = isEnabled( 'plans/wooexpress-small' )
		? performanceAndEssentialOption
		: performanceOnlyOption;

	return (
		<>
			<BodySectionCssClass bodyClass={ [ 'is-ecommerce-trial-plan' ] } />

			<div className="e-commerce-trial-plans__banner-wrapper">
				<ECommerceTrialBanner />
			</div>

			{ upgradeOptions }
		</>
	);
};

export default ECommerceTrialPlansPage;
