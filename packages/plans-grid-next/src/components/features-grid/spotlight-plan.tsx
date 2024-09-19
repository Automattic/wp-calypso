import { FEATURE_GROUP_STORAGE, getPlanClass, isFreePlan } from '@automattic/calypso-products';
import { AddOns } from '@automattic/data-stores';
import clsx from 'clsx';
import { GridPlan, PlanActionOverrides } from '../../types';
import BillingTimeframes from './billing-timeframes';
import PlanFeaturesList from './plan-features-list';
import PlanHeaders from './plan-headers';
import PlanLogos from './plan-logos';
import PlanPrices from './plan-prices';
import PlanTagline from './plan-tagline';
import TopButtons from './top-buttons';
import './spotlight-plan.scss';

type SpotlightPlanProps = {
	currentSitePlanSlug?: string | null;
	gridPlanForSpotlight?: GridPlan;
	isInSignup: boolean;
	onStorageAddOnClick?: ( addOnSlug: AddOns.StorageAddOnSlug ) => void;
	planActionOverrides?: PlanActionOverrides;
	showUpgradeableStorage: boolean;
	options?: {
		isTableCell?: boolean;
	};
};

const SpotlightPlan = ( {
	currentSitePlanSlug,
	gridPlanForSpotlight,
	isInSignup,
	onStorageAddOnClick,
	planActionOverrides,
	showUpgradeableStorage,
}: SpotlightPlanProps ) => {
	if ( ! gridPlanForSpotlight ) {
		return null;
	}

	const spotlightPlanClasses = clsx(
		'plan-features-2023-grid__plan-spotlight',
		getPlanClass( gridPlanForSpotlight.planSlug )
	);

	const isNotFreePlan = ! isFreePlan( gridPlanForSpotlight.planSlug );

	return (
		<div className={ spotlightPlanClasses }>
			<PlanLogos renderedGridPlans={ [ gridPlanForSpotlight ] } isInSignup={ false } />
			<PlanHeaders renderedGridPlans={ [ gridPlanForSpotlight ] } />
			{ isNotFreePlan && <PlanTagline renderedGridPlans={ [ gridPlanForSpotlight ] } /> }
			{ isNotFreePlan && (
				<PlanPrices
					renderedGridPlans={ [ gridPlanForSpotlight ] }
					currentSitePlanSlug={ currentSitePlanSlug }
				/>
			) }
			{ isNotFreePlan && <BillingTimeframes renderedGridPlans={ [ gridPlanForSpotlight ] } /> }
			<PlanFeaturesList
				renderedGridPlans={ [ gridPlanForSpotlight ] }
				featureGroupSlug={ FEATURE_GROUP_STORAGE }
				onStorageAddOnClick={ onStorageAddOnClick }
				showUpgradeableStorage={ showUpgradeableStorage }
			/>
			<TopButtons
				renderedGridPlans={ [ gridPlanForSpotlight ] }
				isInSignup={ isInSignup }
				currentSitePlanSlug={ currentSitePlanSlug }
				planActionOverrides={ planActionOverrides }
			/>
		</div>
	);
};

export default SpotlightPlan;
