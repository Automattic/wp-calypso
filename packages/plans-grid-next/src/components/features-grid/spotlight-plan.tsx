import {
	PlanSlug,
	WPComStorageAddOnSlug,
	getPlanClass,
	isFreePlan,
} from '@automattic/calypso-products';
import classNames from 'classnames';
import { GridPlan, PlanActionOverrides } from '../../types';
import BillingTimeframes from './billing-timeframes';
import PlanHeaders from './plan-headers';
import PlanLogos from './plan-logos';
import PlanPrice from './plan-price';
import PlanStorageOptions from './plan-storage-options';
import PlanTagline from './plan-tagline';
import TopButtons from './top-buttons';

type SpotlightPlanProps = {
	currentSitePlanSlug?: string | null;
	gridPlanForSpotlight?: GridPlan;
	intervalType: string;
	isInSignup: boolean;
	isLaunchPage?: boolean | null;
	onStorageAddOnClick?: ( addOnSlug: WPComStorageAddOnSlug ) => void;
	onUpgradeClick: ( planSlug: PlanSlug ) => void;
	planActionOverrides?: PlanActionOverrides;
	planUpgradeCreditsApplicable?: number | null;
	showUpgradeableStorage: boolean;
	options?: {
		isTableCell?: boolean;
	};
};

const SpotlightPlan = ( {
	currentSitePlanSlug,
	gridPlanForSpotlight,
	intervalType,
	isInSignup,
	isLaunchPage,
	onStorageAddOnClick,
	onUpgradeClick,
	planActionOverrides,
	planUpgradeCreditsApplicable,
	showUpgradeableStorage,
}: SpotlightPlanProps ) => {
	if ( ! gridPlanForSpotlight ) {
		return null;
	}

	const spotlightPlanClasses = classNames(
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
				<PlanPrice
					renderedGridPlans={ [ gridPlanForSpotlight ] }
					planUpgradeCreditsApplicable={ planUpgradeCreditsApplicable }
					currentSitePlanSlug={ currentSitePlanSlug }
				/>
			) }
			{ isNotFreePlan && <BillingTimeframes renderedGridPlans={ [ gridPlanForSpotlight ] } /> }
			<PlanStorageOptions
				renderedGridPlans={ [ gridPlanForSpotlight ] }
				intervalType={ intervalType }
				onStorageAddOnClick={ onStorageAddOnClick }
				showUpgradeableStorage={ showUpgradeableStorage }
			/>
			<TopButtons
				renderedGridPlans={ [ gridPlanForSpotlight ] }
				isInSignup={ isInSignup }
				isLaunchPage={ isLaunchPage }
				currentSitePlanSlug={ currentSitePlanSlug }
				planActionOverrides={ planActionOverrides }
				onUpgradeClick={ onUpgradeClick }
			/>
		</div>
	);
};

export default SpotlightPlan;
