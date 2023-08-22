import { isFreePlan, PlanSlug } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import QueryActivePromotions from 'calypso/components/data/query-active-promotions';
import { useIsPlanUpgradeCreditVisible } from 'calypso/my-sites/plan-features-2023-grid/hooks/use-is-plan-upgrade-credit-visible';
import getCurrentPlanPurchaseId from 'calypso/state/selectors/get-current-plan-purchase-id';
import { isCurrentUserCurrentPlanOwner } from 'calypso/state/sites/plans/selectors';
import { getSiteSlug, isCurrentPlanPaid } from 'calypso/state/sites/selectors';
import CalypsoShoppingCartProvider from '../checkout/calypso-shopping-cart-provider';
import { getManagePurchaseUrlFor } from '../purchases/paths';
import PlanComparisonGrid from './components/plan-comparison-grid';
import PlanFeaturesGrid from './components/plan-features-grid';
import PlansGridContextProvider from './grid-context';
import useIsLargeCurrency from './hooks/npm-ready/use-is-large-currency';
import type { PlanFeaturesGridProps, PlanComparisonGridProps } from './types';
import type { IAppState } from 'calypso/state/types';
import './style.scss';

const PlanComparisonGrid2023 = ( {
	intervalType,
	isInSignup,
	isLaunchPage,
	flowName,
	currentSitePlanSlug,
	siteId,
	selectedPlan,
	selectedFeature,
	isGlobalStylesOnPersonal,
	showLegacyStorageFeature,
	intent,
	gridPlans,
	usePricingMetaForGridPlans,
	allFeaturesList,
	onUpgradeClick: ownPropsOnUpgradeClick,
}: PlanComparisonGridProps ) => {
	// TODO clk: canUserManagePlan should be passed through props instead of being calculated here
	const canUserPurchasePlan = useSelector( ( state: IAppState ) =>
		siteId
			? ! isCurrentPlanPaid( state, siteId ) || isCurrentUserCurrentPlanOwner( state, siteId )
			: null
	);
	const purchaseId = useSelector( ( state: IAppState ) =>
		siteId ? getCurrentPlanPurchaseId( state, siteId ) : null
	);
	// TODO clk: selectedSiteSlug has no other use than computing manageRef below. stop propagating it through props
	const selectedSiteSlug = useSelector( ( state: IAppState ) => getSiteSlug( state, siteId ) );

	const manageHref =
		purchaseId && selectedSiteSlug
			? getManagePurchaseUrlFor( selectedSiteSlug, purchaseId )
			: `/plans/my-plan/${ siteId }`;

	const handleUpgradeClick = ( planSlug: PlanSlug ) => {
		const { cartItemForPlan } =
			gridPlans.find( ( gridPlan ) => gridPlan.planSlug === planSlug ) ?? {};

		if ( cartItemForPlan ) {
			ownPropsOnUpgradeClick?.( cartItemForPlan );
			return;
		}

		if ( isFreePlan( planSlug ) ) {
			ownPropsOnUpgradeClick?.( null );
			return;
		}
	};

	if ( isInSignup ) {
		return (
			<>
				<QueryActivePromotions />
				<PlansGridContextProvider
					intent={ intent }
					gridPlans={ gridPlans }
					usePricingMetaForGridPlans={ usePricingMetaForGridPlans }
					allFeaturesList={ allFeaturesList }
				>
					<PlanComparisonGrid
						intent={ intent }
						gridPlans={ gridPlans }
						usePricingMetaForGridPlans={ usePricingMetaForGridPlans }
						allFeaturesList={ allFeaturesList }
						intervalType={ intervalType }
						isInSignup={ isInSignup }
						isLaunchPage={ isLaunchPage }
						flowName={ flowName }
						currentSitePlanSlug={ currentSitePlanSlug }
						manageHref={ manageHref }
						canUserPurchasePlan={ canUserPurchasePlan }
						selectedSiteSlug={ selectedSiteSlug }
						onUpgradeClick={ handleUpgradeClick }
						siteId={ siteId }
						selectedPlan={ selectedPlan }
						selectedFeature={ selectedFeature }
						isGlobalStylesOnPersonal={ isGlobalStylesOnPersonal }
						showLegacyStorageFeature={ showLegacyStorageFeature }
					/>
				</PlansGridContextProvider>
			</>
		);
	}

	return (
		<CalypsoShoppingCartProvider>
			<QueryActivePromotions />
			<PlansGridContextProvider
				intent={ intent }
				gridPlans={ gridPlans }
				usePricingMetaForGridPlans={ usePricingMetaForGridPlans }
				allFeaturesList={ allFeaturesList }
			>
				<PlanComparisonGrid
					intent={ intent }
					gridPlans={ gridPlans }
					usePricingMetaForGridPlans={ usePricingMetaForGridPlans }
					allFeaturesList={ allFeaturesList }
					intervalType={ intervalType }
					isInSignup={ isInSignup }
					isLaunchPage={ isLaunchPage }
					flowName={ flowName }
					currentSitePlanSlug={ currentSitePlanSlug }
					manageHref={ manageHref }
					canUserPurchasePlan={ canUserPurchasePlan }
					selectedSiteSlug={ selectedSiteSlug }
					onUpgradeClick={ handleUpgradeClick }
					siteId={ siteId }
					selectedPlan={ selectedPlan }
					selectedFeature={ selectedFeature }
					isGlobalStylesOnPersonal={ isGlobalStylesOnPersonal }
					showLegacyStorageFeature={ showLegacyStorageFeature }
				/>
			</PlansGridContextProvider>
		</CalypsoShoppingCartProvider>
	);
};

const PlanFeaturesGrid2023 = ( props: PlanFeaturesGridProps ) => {
	const {
		siteId,
		gridPlans,
		usePricingMetaForGridPlans,
		intent,
		allFeaturesList,
		onUpgradeClick: ownPropsOnUpgradeClick,
	} = props;
	const translate = useTranslate();
	const isPlanUpgradeCreditEligible = useIsPlanUpgradeCreditVisible(
		siteId,
		gridPlans.map( ( gridPlan ) => gridPlan.planSlug )
	);
	const isLargeCurrency = useIsLargeCurrency( {
		gridPlans,
	} );

	// TODO clk: canUserManagePlan should be passed through props instead of being calculated here
	const canUserPurchasePlan = useSelector( ( state: IAppState ) =>
		siteId
			? ! isCurrentPlanPaid( state, siteId ) || isCurrentUserCurrentPlanOwner( state, siteId )
			: null
	);
	const purchaseId = useSelector( ( state: IAppState ) =>
		siteId ? getCurrentPlanPurchaseId( state, siteId ) : null
	);
	// TODO clk: selectedSiteSlug has no other use than computing manageRef below. stop propagating it through props
	const selectedSiteSlug = useSelector( ( state: IAppState ) => getSiteSlug( state, siteId ) );

	const manageHref =
		purchaseId && selectedSiteSlug
			? getManagePurchaseUrlFor( selectedSiteSlug, purchaseId )
			: `/plans/my-plan/${ siteId }`;

	const handleUpgradeClick = ( planSlug: PlanSlug ) => {
		const { cartItemForPlan } =
			gridPlans.find( ( gridPlan ) => gridPlan.planSlug === planSlug ) ?? {};

		if ( cartItemForPlan ) {
			ownPropsOnUpgradeClick?.( cartItemForPlan );
			return;
		}

		if ( isFreePlan( planSlug ) ) {
			ownPropsOnUpgradeClick?.( null );
			return;
		}
	};

	if ( props.isInSignup ) {
		return (
			<>
				<QueryActivePromotions />
				<PlansGridContextProvider
					intent={ intent }
					gridPlans={ gridPlans }
					usePricingMetaForGridPlans={ usePricingMetaForGridPlans }
					allFeaturesList={ allFeaturesList }
				>
					<PlanFeaturesGrid
						{ ...props }
						isPlanUpgradeCreditEligible={ isPlanUpgradeCreditEligible }
						isLargeCurrency={ isLargeCurrency }
						canUserPurchasePlan={ canUserPurchasePlan }
						manageHref={ manageHref }
						selectedSiteSlug={ selectedSiteSlug }
						translate={ translate }
						onUpgradeClick={ handleUpgradeClick }
					/>
				</PlansGridContextProvider>
			</>
		);
	}

	return (
		<CalypsoShoppingCartProvider>
			<QueryActivePromotions />
			<PlansGridContextProvider
				intent={ intent }
				gridPlans={ gridPlans }
				usePricingMetaForGridPlans={ usePricingMetaForGridPlans }
				allFeaturesList={ allFeaturesList }
			>
				<PlanFeaturesGrid
					{ ...props }
					isPlanUpgradeCreditEligible={ isPlanUpgradeCreditEligible }
					isLargeCurrency={ isLargeCurrency }
					canUserPurchasePlan={ canUserPurchasePlan }
					manageHref={ manageHref }
					selectedSiteSlug={ selectedSiteSlug }
					translate={ translate }
					onUpgradeClick={ handleUpgradeClick }
				/>
			</PlansGridContextProvider>
		</CalypsoShoppingCartProvider>
	);
};

export { PlanComparisonGrid2023, PlanFeaturesGrid2023 };
