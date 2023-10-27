import { useTranslate } from 'i18n-calypso';
import CalypsoShoppingCartProvider from '../checkout/calypso-shopping-cart-provider';
import ComparisonGrid from './components/comparison-grid';
import FeaturesGrid from './components/features-grid';
import PlansGridContextProvider from './grid-context';
import useIsLargeCurrency from './hooks/npm-ready/use-is-large-currency';
import useUpgradeClickHandler from './hooks/npm-ready/use-upgrade-click-handler';
import { useIsPlanUpgradeCreditVisible } from './hooks/use-is-plan-upgrade-credit-visible';
import { usePlanPricingInfoFromGridPlans } from './hooks/use-plan-pricing-info-from-grid-plans';
import type {
	GridPlan,
	PlansIntent,
	UsePricingMetaForGridPlans,
} from './hooks/npm-ready/data-store/use-grid-plans';
import type { DataResponse, PlanActionOverrides } from './types';
import type { FeatureList, WPComStorageAddOnSlug } from '@automattic/calypso-products';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import './style.scss';

/*
 *	TODO clk: On PlansGridProps:
 *	1.	These props need to be split into what's needed separately for the internal grids and what's needed for the exported wrappers.
 *		This is currently also used as the internal type for the FeaturesGrid (wrongly).
 *			- onUpgradeClick is only needed for the wrappers exported from here. Internally the grids take a transformed
 *			handleUpgradeClick/onUpgradeClick function (force renamed to handleUpgradeClick in FeaturesGrid)
 *			- allFeaturesList is only relevant for the ComparisonGrid
 *			- gridPlanForSpotlight is only relevant for the FeaturesGrid
 *			- etc.
 *	2.	Explicitly set optional props and default values. Only absolutely vital props should be required.
 */
export interface PlansGridProps {
	gridPlans: GridPlan[];
	gridPlanForSpotlight?: GridPlan;
	// allFeaturesList temporary until feature definitions are ported to calypso-products package
	allFeaturesList: FeatureList;
	isInSignup: boolean;
	siteId?: number | null;
	isLaunchPage?: boolean | null;
	isReskinned?: boolean;
	onUpgradeClick?: ( cartItems?: MinimalRequestCartProduct[] | null ) => void;
	onStorageAddOnClick?: ( addOnSlug: WPComStorageAddOnSlug ) => void;
	flowName?: string | null;
	paidDomainName?: string;
	generatedWPComSubdomain: DataResponse< { domain_name: string } >; // used to show a wpcom free domain in the Free plan column when a paid domain is picked.
	intervalType: string;
	currentSitePlanSlug?: string | null;
	hideUnavailableFeatures?: boolean; // used to hide features that are not available, instead of strike-through as explained in #76206
	planActionOverrides?: PlanActionOverrides;
	// Value of the `?plan=` query param, so we can highlight a given plan.
	selectedPlan?: string;
	// Value of the `?feature=` query param, so we can highlight a given feature and hide plans without it.
	selectedFeature?: string;
	intent?: PlansIntent;
	isCustomDomainAllowedOnFreePlan: DataResponse< boolean >; // indicate when a custom domain is allowed to be used with the Free plan.
	showLegacyStorageFeature?: boolean;
	showUpgradeableStorage: boolean; // feature flag used to show the storage add-on dropdown
	stickyRowOffset: number;
	usePricingMetaForGridPlans: UsePricingMetaForGridPlans;
	currentPlanManageHref?: string;
	canUserManageCurrentPlan?: boolean | null;
	showRefundPeriod?: boolean;
}

const WrappedComparisonGrid = ( {
	siteId,
	intent,
	gridPlans,
	usePricingMetaForGridPlans,
	allFeaturesList,
	onUpgradeClick,
	intervalType,
	isInSignup,
	isLaunchPage,
	flowName,
	currentSitePlanSlug,
	selectedPlan,
	selectedFeature,
	showLegacyStorageFeature,
	showUpgradeableStorage,
	onStorageAddOnClick,
	currentPlanManageHref,
	canUserManageCurrentPlan,
	...otherProps
}: PlansGridProps ) => {
	const handleUpgradeClick = useUpgradeClickHandler( {
		gridPlans,
		onUpgradeClick,
	} );

	if ( isInSignup ) {
		return (
			<PlansGridContextProvider
				intent={ intent }
				gridPlans={ gridPlans }
				usePricingMetaForGridPlans={ usePricingMetaForGridPlans }
				allFeaturesList={ allFeaturesList }
			>
				<ComparisonGrid
					intervalType={ intervalType }
					isInSignup={ isInSignup }
					isLaunchPage={ isLaunchPage }
					flowName={ flowName }
					currentSitePlanSlug={ currentSitePlanSlug }
					currentPlanManageHref={ currentPlanManageHref }
					canUserManageCurrentPlan={ canUserManageCurrentPlan }
					onUpgradeClick={ handleUpgradeClick }
					siteId={ siteId }
					selectedPlan={ selectedPlan }
					selectedFeature={ selectedFeature }
					showLegacyStorageFeature={ showLegacyStorageFeature }
					showUpgradeableStorage={ showUpgradeableStorage }
					onStorageAddOnClick={ onStorageAddOnClick }
					{ ...otherProps }
				/>
			</PlansGridContextProvider>
		);
	}

	return (
		<PlansGridContextProvider
			intent={ intent }
			gridPlans={ gridPlans }
			usePricingMetaForGridPlans={ usePricingMetaForGridPlans }
			allFeaturesList={ allFeaturesList }
		>
			<CalypsoShoppingCartProvider>
				<ComparisonGrid
					intervalType={ intervalType }
					isInSignup={ isInSignup }
					isLaunchPage={ isLaunchPage }
					flowName={ flowName }
					currentSitePlanSlug={ currentSitePlanSlug }
					currentPlanManageHref={ currentPlanManageHref }
					canUserManageCurrentPlan={ canUserManageCurrentPlan }
					onUpgradeClick={ handleUpgradeClick }
					siteId={ siteId }
					selectedPlan={ selectedPlan }
					selectedFeature={ selectedFeature }
					showLegacyStorageFeature={ showLegacyStorageFeature }
					showUpgradeableStorage={ showUpgradeableStorage }
					onStorageAddOnClick={ onStorageAddOnClick }
					{ ...otherProps }
				/>
			</CalypsoShoppingCartProvider>
		</PlansGridContextProvider>
	);
};

const WrappedFeaturesGrid = ( props: PlansGridProps ) => {
	const {
		siteId,
		intent,
		gridPlans,
		usePricingMetaForGridPlans,
		allFeaturesList,
		onUpgradeClick,
		currentPlanManageHref,
		canUserManageCurrentPlan,
	} = props;
	const translate = useTranslate();
	const isPlanUpgradeCreditEligible = useIsPlanUpgradeCreditVisible(
		siteId,
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

	if ( props.isInSignup ) {
		return (
			<PlansGridContextProvider
				intent={ intent }
				gridPlans={ gridPlans }
				usePricingMetaForGridPlans={ usePricingMetaForGridPlans }
				allFeaturesList={ allFeaturesList }
			>
				<FeaturesGrid
					{ ...props }
					isPlanUpgradeCreditEligible={ isPlanUpgradeCreditEligible }
					isLargeCurrency={ isLargeCurrency }
					canUserManageCurrentPlan={ canUserManageCurrentPlan }
					currentPlanManageHref={ currentPlanManageHref }
					translate={ translate }
					handleUpgradeClick={ handleUpgradeClick }
				/>
			</PlansGridContextProvider>
		);
	}

	return (
		<PlansGridContextProvider
			intent={ intent }
			gridPlans={ gridPlans }
			usePricingMetaForGridPlans={ usePricingMetaForGridPlans }
			allFeaturesList={ allFeaturesList }
		>
			<CalypsoShoppingCartProvider>
				<FeaturesGrid
					{ ...props }
					isPlanUpgradeCreditEligible={ isPlanUpgradeCreditEligible }
					isLargeCurrency={ isLargeCurrency }
					canUserManageCurrentPlan={ canUserManageCurrentPlan }
					currentPlanManageHref={ currentPlanManageHref }
					translate={ translate }
					handleUpgradeClick={ handleUpgradeClick }
				/>
			</CalypsoShoppingCartProvider>
		</PlansGridContextProvider>
	);
};

export { WrappedFeaturesGrid as FeaturesGrid, WrappedComparisonGrid as ComparisonGrid };
