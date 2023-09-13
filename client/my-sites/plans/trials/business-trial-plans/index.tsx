import { PLAN_FREE, getPlanPath, isBusinessPlan } from '@automattic/calypso-products';
import page from 'page';
import { useCallback } from 'react';
import { getTrialCheckoutUrl } from 'calypso/lib/trials/get-trial-checkout-url';
import PlansFeaturesMain from 'calypso/my-sites/plans-features-main';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

interface BusinessTrialPlansProps {
	siteId: number | null;
	siteSlug: string;
	triggerTracksEvent?: ( planSlug: string ) => void;
}

export function BusinessTrialPlans( props: BusinessTrialPlansProps ) {
	const { siteId, siteSlug, triggerTracksEvent } = props;

	const onUpgradeClick = useCallback(
		( cartItem?: MinimalRequestCartProduct | null ) => {
			const upgradePlanSlug = cartItem?.product_slug ?? PLAN_FREE;

			triggerTracksEvent?.( upgradePlanSlug );

			const planPath = getPlanPath( upgradePlanSlug ) ?? '';

			const checkoutUrl = isBusinessPlan( upgradePlanSlug )
				? getTrialCheckoutUrl( { productSlug: planPath, siteSlug } )
				: `/checkout/${ siteSlug }/${ planPath }`;

			page( checkoutUrl );
		},
		[ siteSlug, triggerTracksEvent ]
	);

	return (
		<div className="business-trial-plans__grid is-2023-pricing-grid">
			<PlansFeaturesMain
				siteId={ siteId }
				onUpgradeClick={ onUpgradeClick }
				intervalType="yearly"
				hidePlanTypeSelector={ true }
				hideUnavailableFeatures={ true }
				hidePlansFeatureComparison={ true }
				intent="plans-business-trial"
			/>
		</div>
	);
}
