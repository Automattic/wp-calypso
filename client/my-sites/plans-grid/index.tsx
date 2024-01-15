import { useTranslate } from 'i18n-calypso';
import ComparisonGrid from './components/comparison-grid';
import FeaturesGrid from './components/features-grid';
import PlanTypeSelector from './components/plan-type-selector';
import PlansGridContextProvider from './grid-context';
import useIsLargeCurrency from './hooks/npm-ready/use-is-large-currency';
import useUpgradeClickHandler from './hooks/npm-ready/use-upgrade-click-handler';
import { useIsPlanUpgradeCreditVisible } from './hooks/use-is-plan-upgrade-credit-visible';
import { usePlanPricingInfoFromGridPlans } from './hooks/use-plan-pricing-info-from-grid-plans';
import './style.scss';
import type { ComparisonGridExternalProps, FeaturesGridExternalProps } from './types';

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
	const translate = useTranslate();
	const isPlanUpgradeCreditEligible = useIsPlanUpgradeCreditVisible(
		selectedSiteId,
		gridPlans.map( ( gridPlan ) => gridPlan.planSlug )
	);
	const { prices, currencyCode } = usePlanPricingInfoFromGridPlans( {
		gridPlans,
	} );
	const isLargeCurrency = useIsLargeCurrency( {
		prices,
		currencyCode: currencyCode || 'USD',
	} );

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
			<FeaturesGrid
				{ ...props }
				isPlanUpgradeCreditEligible={ isPlanUpgradeCreditEligible }
				isLargeCurrency={ isLargeCurrency }
				translate={ translate }
				onUpgradeClick={ handleUpgradeClick }
			/>
		</PlansGridContextProvider>
	);
};

export {
	WrappedComparisonGrid as ComparisonGrid,
	WrappedFeaturesGrid as FeaturesGrid,
	PlanTypeSelector,
};
