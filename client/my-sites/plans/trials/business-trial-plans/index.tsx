import { PLAN_FREE, PRODUCT_1GB_SPACE, isBusinessPlan } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { useCallback } from 'react';
import { getPlanCartItem } from 'calypso/lib/cart-values/cart-items';
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
		( cartItems?: MinimalRequestCartProduct[] | null ) => {
			const upgradePlanSlug = getPlanCartItem( cartItems )?.product_slug ?? PLAN_FREE;

			triggerTracksEvent?.( upgradePlanSlug );

			const cartItemForStorageAddOn = cartItems?.find(
				( items ) => items.product_slug === PRODUCT_1GB_SPACE
			);

			const checkoutUrl = isBusinessPlan( upgradePlanSlug )
				? getTrialCheckoutUrl( {
						productSlug: upgradePlanSlug,
						siteSlug,
						addOn: cartItemForStorageAddOn,
				  } )
				: `/checkout/${ siteSlug }/${ upgradePlanSlug }`;

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
				hidePlanTypeSelector
				hideUnavailableFeatures
				hidePlansFeatureComparison
				intent="plans-business-trial"
			/>
		</div>
	);
}
