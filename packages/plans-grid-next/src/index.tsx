import ComparisonGrid from './components/comparison-grid';
import FeaturesGrid from './components/features-grid';
import PlanButton from './components/plan-button';
import PlanTypeSelector from './components/plan-type-selector';
import { Plans2023Tooltip } from './components/plans-2023-tooltip';
import PlansGridContextProvider from './grid-context';
import useGridPlans from './hooks/data-store/use-grid-plans';
import usePlanFeaturesForGridPlans from './hooks/data-store/use-plan-features-for-grid-plans';
import useRestructuredPlanFeaturesForComparisonGrid from './hooks/data-store/use-restructured-plan-features-for-comparison-grid';
import { useManageTooltipToggle } from './hooks/use-manage-tooltip-toggle';
import useUpgradeClickHandler from './hooks/use-upgrade-click-handler';
import type { ComparisonGridExternalProps, FeaturesGridExternalProps } from './types';
import './style.scss';

const WrappedComparisonGrid = ( {
	selectedSiteId,
	intent,
	gridPlans,
	useCheckPlanAvailabilityForPurchase,
	recordTracksEvent,
	allFeaturesList,
	onUpgradeClick,
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
	const handleUpgradeClick = useUpgradeClickHandler( {
		gridPlans,
		onUpgradeClick,
	} );

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
				onUpgradeClick={ handleUpgradeClick }
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
		onUpgradeClick,
		coupon,
	} = props;

	const handleUpgradeClick = useUpgradeClickHandler( {
		gridPlans,
		onUpgradeClick,
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
			<FeaturesGrid { ...props } onUpgradeClick={ handleUpgradeClick } />
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
