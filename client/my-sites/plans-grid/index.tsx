import { forwardRef } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import getCurrentPlanPurchaseId from 'calypso/state/selectors/get-current-plan-purchase-id';
import { isCurrentUserCurrentPlanOwner } from 'calypso/state/sites/plans/selectors/is-current-user-current-plan-owner';
import getSiteSlug from 'calypso/state/sites/selectors/get-site-slug';
import isCurrentPlanPaid from 'calypso/state/sites/selectors/is-current-plan-paid';
import CalypsoShoppingCartProvider from '../checkout/calypso-shopping-cart-provider';
import { getManagePurchaseUrlFor } from '../purchases/paths';
import FeaturesGrid from './components/features-grid';
import useIsLargeCurrency from './hooks/npm-ready/use-is-large-currency';
import useUpgradeClickHandler from './hooks/npm-ready/use-upgrade-click-handler';
import { useIsPlanUpgradeCreditVisible } from './hooks/use-is-plan-upgrade-credit-visible';
import type {
	GridPlan,
	PlansIntent,
	UsePricingMetaForGridPlans,
} from './hooks/npm-ready/data-store/use-grid-plans';
import type { DataResponse, PlanActionOverrides } from './types';
import type { PlanTypeSelectorProps } from '../plans-features-main/components/plan-type-selector';
import type { FeatureList, WPComStorageAddOnSlug } from '@automattic/calypso-products';
import type { DomainSuggestion } from '@automattic/data-stores';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import type { IAppState } from 'calypso/state/types';
import './style.scss';

export interface PlansGridProps {
	gridPlansForFeaturesGrid: GridPlan[];
	gridPlansForComparisonGrid: GridPlan[];
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
	wpcomFreeDomainSuggestion: DataResponse< DomainSuggestion >; // used to show a wpcom free domain in the Free plan column when a paid domain is picked.
	intervalType: string;
	currentSitePlanSlug?: string | null;
	hidePlansFeatureComparison?: boolean;
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
	// temporary
	showPlansComparisonGrid: boolean;
	// temporary
	toggleShowPlansComparisonGrid: () => void;
	planTypeSelectorProps: PlanTypeSelectorProps;
	// temporary: callback ref to scroll Odie AI Assistant into view once "Compare plans" button is clicked
	observableForOdieRef: ( observableElement: Element | null ) => void;
}

export default forwardRef< HTMLDivElement, PlansGridProps >(
	function WrappedPlansGrid( props, ref ) {
		const { siteId } = props;
		const translate = useTranslate();
		const isPlanUpgradeCreditEligible = useIsPlanUpgradeCreditVisible(
			props.siteId,
			props.gridPlansForFeaturesGrid.map( ( gridPlan ) => gridPlan.planSlug )
		);
		const isLargeCurrency = useIsLargeCurrency( {
			gridPlans: props.gridPlansForFeaturesGrid,
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

		const handleUpgradeClick = useUpgradeClickHandler( {
			gridPlansForFeaturesGrid: props.gridPlansForFeaturesGrid,
			onUpgradeClick: props.onUpgradeClick,
		} );

		if ( props.isInSignup ) {
			return (
				<FeaturesGrid
					{ ...props }
					plansComparisonGridRef={ ref }
					isPlanUpgradeCreditEligible={ isPlanUpgradeCreditEligible }
					isLargeCurrency={ isLargeCurrency }
					canUserPurchasePlan={ canUserPurchasePlan }
					manageHref={ manageHref }
					selectedSiteSlug={ selectedSiteSlug }
					translate={ translate }
					handleUpgradeClick={ handleUpgradeClick }
				/>
			);
		}

		return (
			<CalypsoShoppingCartProvider>
				<FeaturesGrid
					{ ...props }
					plansComparisonGridRef={ ref }
					isPlanUpgradeCreditEligible={ isPlanUpgradeCreditEligible }
					isLargeCurrency={ isLargeCurrency }
					canUserPurchasePlan={ canUserPurchasePlan }
					manageHref={ manageHref }
					selectedSiteSlug={ selectedSiteSlug }
					translate={ translate }
					handleUpgradeClick={ handleUpgradeClick }
				/>
			</CalypsoShoppingCartProvider>
		);
	}
);
