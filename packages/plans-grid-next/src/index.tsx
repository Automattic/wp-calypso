import { useTranslate } from 'i18n-calypso';
import ComparisonGrid from './components/comparison-grid';
import FeaturesGrid from './components/features-grid';
import PlanButton from './components/plan-button';
import PlanTypeSelector from './components/plan-type-selector';
import { Plans2023Tooltip } from './components/plans-2023-tooltip';
import PlansGridContextProvider from './grid-context';
import useGridPlans from './hooks/data-store/use-grid-plans';
import usePlanFeaturesForGridPlans from './hooks/data-store/use-plan-features-for-grid-plans';
import useRestructuredPlanFeaturesForComparisonGrid from './hooks/data-store/use-restructured-plan-features-for-comparison-grid';
import useIsLargeCurrency from './hooks/use-is-large-currency';
import { useManageTooltipToggle } from './hooks/use-manage-tooltip-toggle';
import { usePlanPricingInfoFromGridPlans } from './hooks/use-plan-pricing-info-from-grid-plans';
import type { ComparisonGridExternalProps, FeaturesGridExternalProps } from './types';
import './style.scss';

const WrappedComparisonGrid = ( {
	selectedSiteId,
	intent,
	gridPlans,
	useCheckPlanAvailabilityForPurchase,
	recordTracksEvent,
	allFeaturesList,
	intervalType,
	isInSignup,
	isLaunchPage,
	currentSitePlanSlug,
	selectedPlan,
	selectedFeature,
	showUpgradeableStorage,
	onStorageAddOnClick,
	stickyRowOffset,
	coupon,
	...otherProps
}: ComparisonGridExternalProps ) => {
	return (
		<PlansGridContextProvider
			intent={ intent }
			selectedSiteId={ selectedSiteId }
			gridPlans={ gridPlans }
			useCheckPlanAvailabilityForPurchase={ useCheckPlanAvailabilityForPurchase }
			recordTracksEvent={ recordTracksEvent }
			allFeaturesList={ allFeaturesList }
			coupon={ coupon }
		>
			<ComparisonGrid
				intervalType={ intervalType }
				isInSignup={ isInSignup }
				isLaunchPage={ isLaunchPage }
				currentSitePlanSlug={ currentSitePlanSlug }
				selectedSiteId={ selectedSiteId }
				selectedPlan={ selectedPlan }
				selectedFeature={ selectedFeature }
				showUpgradeableStorage={ showUpgradeableStorage }
				stickyRowOffset={ stickyRowOffset }
				onStorageAddOnClick={ onStorageAddOnClick }
				{ ...otherProps }
			/>
		</PlansGridContextProvider>
	);
};

const WrappedFeaturesGrid = ( props: FeaturesGridExternalProps ) => {
	const {
		selectedSiteId,
		intent,
		gridPlans,
		useCheckPlanAvailabilityForPurchase,
		recordTracksEvent,
		allFeaturesList,
		coupon,
	} = props;
	const translate = useTranslate();

	const { prices, currencyCode } = usePlanPricingInfoFromGridPlans( {
		gridPlans,
	} );
	const isLargeCurrency = useIsLargeCurrency( {
		prices,
		currencyCode: currencyCode || 'USD',
	} );

	return (
		<PlansGridContextProvider
			intent={ intent }
			selectedSiteId={ selectedSiteId }
			gridPlans={ gridPlans }
			coupon={ coupon }
			useCheckPlanAvailabilityForPurchase={ useCheckPlanAvailabilityForPurchase }
			recordTracksEvent={ recordTracksEvent }
			allFeaturesList={ allFeaturesList }
		>
			<FeaturesGrid { ...props } isLargeCurrency={ isLargeCurrency } translate={ translate } />
		</PlansGridContextProvider>
	);
};

/**
 * Types
 */
export type * from './types';

/**
 * Components
 */
export {
	WrappedComparisonGrid as ComparisonGrid,
	WrappedFeaturesGrid as FeaturesGrid,
	PlanTypeSelector,
	PlanButton,
	Plans2023Tooltip,
};

/**
 * Hooks/helpers
 */
export {
	useManageTooltipToggle,
	useGridPlans,
	usePlanFeaturesForGridPlans,
	useRestructuredPlanFeaturesForComparisonGrid,
};
