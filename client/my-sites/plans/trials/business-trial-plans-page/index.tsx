import { PLAN_BUSINESS, getPlanPath } from '@automattic/calypso-products';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { useCallback } from 'react';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { getTrialCheckoutUrl } from 'calypso/lib/trials/get-trial-checkout-url';
import PlansFeaturesMain from 'calypso/my-sites/plans-features-main';
import TrialBanner from '../trial-banner';

import './style.scss';

interface BusinessTrialPlansPageProps {
	siteId: number | null;
	siteSlug: string;
	triggerTracksEvent?: ( planSlug: string ) => void;
}

const BusinessTrialPlansPage = ( props: BusinessTrialPlansPageProps ) => {
	const { siteId, siteSlug, triggerTracksEvent } = props;

	const onUpgradeClick = useCallback(
		( cartItem?: MinimalRequestCartProduct | null ) => {
			const upgradePlanSlug = cartItem?.product_slug ?? PLAN_BUSINESS;

			triggerTracksEvent?.( upgradePlanSlug );

			const planPath = getPlanPath( upgradePlanSlug ) ?? '';
			const checkoutUrl = getTrialCheckoutUrl( { productSlug: planPath, siteSlug } );

			page( checkoutUrl );
		},
		[ siteSlug, triggerTracksEvent ]
	);

	return (
		<>
			<BodySectionCssClass bodyClass={ [ 'is-migration-trial-plan' ] } />

			<div className="migration-trial-plans__banner-wrapper">
				<TrialBanner />
			</div>

			<PlansFeaturesMain
				siteId={ siteId }
				onUpgradeClick={ onUpgradeClick }
				intervalType="yearly"
				hidePlanTypeSelector={ true }
				hideUnavailableFeatures={ true }
				selectedPlan={ PLAN_BUSINESS }
				intent="plans-business-trial"
			/>
		</>
	);
};

export default BusinessTrialPlansPage;
