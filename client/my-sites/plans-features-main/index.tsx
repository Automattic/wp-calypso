import {
	chooseDefaultCustomerType,
	getPlan,
	getPlanClass,
	getPlanPath,
	isFreePlan,
	isPersonalPlan,
	PlanSlug,
	PLAN_PERSONAL,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { WpcomPlansUI } from '@automattic/data-stores';
import { useDispatch } from '@wordpress/data';
import { useCallback, useState } from '@wordpress/element';
import classNames from 'classnames';
import { localize, useTranslate } from 'i18n-calypso';
import page from 'page';
import { useSelector } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import QueryPlans from 'calypso/components/data/query-plans';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySites from 'calypso/components/data/query-sites';
import FormattedHeader from 'calypso/components/formatted-header';
import { planItem as getCartItemForPlan } from 'calypso/lib/cart-values/cart-items';
import { isValidFeatureKey } from 'calypso/lib/plans/features-list';
import PlanNotice from 'calypso/my-sites/plans-features-main/components/plan-notice';
import PlanTypeSelector from 'calypso/my-sites/plans-features-main/components/plan-type-selector';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import canUpgradeToPlan from 'calypso/state/selectors/can-upgrade-to-plan';
import getDomainFromHomeUpsellInQuery from 'calypso/state/selectors/get-domain-from-home-upsell-in-query';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import isEligibleForWpComMonthlyPlan from 'calypso/state/selectors/is-eligible-for-wpcom-monthly-plan';
import { useSiteGlobalStylesStatus } from 'calypso/state/sites/hooks/use-site-global-styles-status';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSitePlanSlug, getSiteSlug } from 'calypso/state/sites/selectors';
import usePlansWithIntent, {
	GridPlan,
} from '../plan-features-2023-grid/hooks/npm-ready/data-store/use-wpcom-plans-with-intent';
import { FreePlanFreeDomainDialog } from './components/free-plan-free-domain-dialog';
import { FreePlanPaidDomainDialog } from './components/free-plan-paid-domain-dialog';
import useFilterPlansForPlanFeatures from './hooks/use-filter-plans-for-plan-features';
import useIsCustomDomainAllowedOnFreePlan from './hooks/use-is-custom-domain-allowed-on-free-plan';
import { useIsPlanUpsellEnabledOnFreeDomain } from './hooks/use-is-plan-upsell-enabled-on-free-domain';
import usePlanBillingPeriod from './hooks/use-plan-billing-period';
import usePlanFromUpsells from './hooks/use-plan-from-upsells';
import usePlanIntentFromSiteMeta from './hooks/use-plan-intent-from-site-meta';
import usePlanUpgradeabilityCheck from './hooks/use-plan-upgradeability-check';
import useGetFreeSubdomainSuggestion from './hooks/use-suggested-free-domain-from-paid-domain';
import type { IntervalType } from './types';
import type { PlansIntent } from '../plan-features-2023-grid/hooks/npm-ready/data-store/use-wpcom-plans-with-intent';
import type { DomainSuggestion } from '@automattic/data-stores';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import type { PlanFeatures2023GridProps } from 'calypso/my-sites/plan-features-2023-grid';
import type {
	DataResponse,
	PlanActionOverrides,
} from 'calypso/my-sites/plan-features-2023-grid/types';
import type { PlanTypeSelectorProps } from 'calypso/my-sites/plans-features-main/components/plan-type-selector';
import type { IAppState } from 'calypso/state/types';

import './style.scss';

export interface PlansFeaturesMainProps {
	siteId?: number | null;
	intent?: PlansIntent | null;
	isInSignup?: boolean;
	plansWithScroll?: boolean;
	customerType?: string;
	basePlansPath?: string;
	selectedPlan?: PlanSlug;
	selectedFeature?: string;
	onUpgradeClick?: ( cartItemForPlan?: MinimalRequestCartProduct | null ) => void;
	redirectToAddDomainFlow?: boolean;
	hidePlanTypeSelector?: boolean;
	paidDomainName?: string;
	freeSubdomain?: string;
	siteTitle?: string;
	signupFlowUserName?: string;
	flowName?: string | null;
	removePaidDomain?: () => void;
	setSiteUrlAsFreeDomainSuggestion?: ( freeDomainSuggestion: DomainSuggestion ) => void;
	intervalType?: IntervalType;
	planTypeSelector?: 'customer' | 'interval';
	withDiscount?: string;
	discountEndDate?: Date;
	hidePlansFeatureComparison?: boolean;
	hideFreePlan?: boolean; // to be deprecated
	hidePersonalPlan?: boolean; // to be deprecated
	hidePremiumPlan?: boolean; // to be deprecated
	hideBusinessPlan?: boolean; // to be deprecated
	hideEcommercePlan?: boolean; // to be deprecated
	hideEnterprisePlan?: boolean; // to be deprecated
	isStepperUpgradeFlow?: boolean;
	isLaunchPage?: boolean | null;
	isReskinned?: boolean;
	isPlansInsideStepper?: boolean;
	showBiennialToggle?: boolean;
	hideUnavailableFeatures?: boolean; // used to hide features that are not available, instead of strike-through as explained in #76206
	showLegacyStorageFeature?: boolean;
	isSpotlightOnCurrentPlan?: boolean;
}

type OnboardingPricingGrid2023Props = PlansFeaturesMainProps & {
	showUpgradeableStorage: boolean;
	visiblePlans: PlanSlug[];
	planRecords: Record< PlanSlug, GridPlan >;
	planTypeSelectorProps?: PlanTypeSelectorProps;
	sitePlanSlug?: PlanSlug | null;
	siteSlug?: string | null;
	intent?: PlansIntent;
	wpcomFreeDomainSuggestion: DataResponse< DomainSuggestion >;
	isCustomDomainAllowedOnFreePlan: DataResponse< boolean >;
};

const SecondaryFormattedHeader = ( { siteSlug }: { siteSlug?: string | null } ) => {
	const translate = useTranslate();
	const headerText = translate( 'Upgrade your plan to access this feature and more' );
	const subHeaderText = (
		<Button className="plans-features-main__view-all-plans is-link" href={ `/plans/${ siteSlug }` }>
			{ translate( 'View all plans' ) }
		</Button>
	);

	return (
		<FormattedHeader
			headerText={ headerText }
			subHeaderText={ subHeaderText }
			compactOnMobile
			isSecondary
		/>
	);
};

const OnboardingPricingGrid2023 = ( props: OnboardingPricingGrid2023Props ) => {
	const {
		planRecords,
		visiblePlans,
		paidDomainName,
		wpcomFreeDomainSuggestion,
		isInSignup,
		isLaunchPage,
		flowName,
		onUpgradeClick,
		selectedFeature,
		selectedPlan,
		siteId,
		plansWithScroll,
		isReskinned,
		intervalType,
		planTypeSelectorProps,
		hidePlansFeatureComparison,
		hideUnavailableFeatures,
		sitePlanSlug,
		siteSlug,
		intent,
		isCustomDomainAllowedOnFreePlan,
		showLegacyStorageFeature,
		isSpotlightOnCurrentPlan,
		showUpgradeableStorage,
	} = props;
	const translate = useTranslate();
	const { setShowDomainUpsellDialog } = useDispatch( WpcomPlansUI.store );
	const domainFromHomeUpsellFlow = useSelector( getDomainFromHomeUpsellInQuery );
	const showDomainUpsellDialog = useCallback( () => {
		setShowDomainUpsellDialog( true );
	}, [ setShowDomainUpsellDialog ] );
	const { globalStylesInPersonalPlan } = useSiteGlobalStylesStatus( siteId );

	let planActionOverrides: PlanActionOverrides | undefined;
	if ( sitePlanSlug && isFreePlan( sitePlanSlug ) ) {
		planActionOverrides = {
			loggedInFreePlan: domainFromHomeUpsellFlow
				? {
						callback: showDomainUpsellDialog,
						text: translate( 'Keep my plan', { context: 'verb' } ),
				  }
				: {
						callback: () => {
							page.redirect( `/add-ons/${ siteSlug }` );
						},
						text: translate( 'Manage add-ons', { context: 'verb' } ),
				  },
		};
	}

	let spotlightPlanSlug: PlanSlug | undefined;
	if ( sitePlanSlug && isSpotlightOnCurrentPlan ) {
		spotlightPlanSlug = Object.keys( planRecords ).find(
			( planSlug ) => getPlanClass( planSlug ) === getPlanClass( sitePlanSlug )
		) as PlanSlug | undefined;
	}

	const asyncProps: PlanFeatures2023GridProps = {
		paidDomainName,
		wpcomFreeDomainSuggestion,
		isInSignup,
		isLaunchPage,
		onUpgradeClick,
		planRecords, // We need all the plans in order to show the correct features in the plan comparison table
		flowName,
		visiblePlans,
		selectedFeature,
		selectedPlan,
		siteId,
		isReskinned,
		intervalType,
		hidePlansFeatureComparison,
		hideUnavailableFeatures,
		currentSitePlanSlug: sitePlanSlug,
		planActionOverrides,
		intent,
		isCustomDomainAllowedOnFreePlan,
		isGlobalStylesOnPersonal: globalStylesInPersonalPlan,
		showLegacyStorageFeature,
		spotlightPlanSlug,
		showUpgradeableStorage,
	};

	const asyncPlanFeatures2023Grid = (
		<AsyncLoad
			require="calypso/my-sites/plan-features-2023-grid"
			{ ...asyncProps }
			planTypeSelectorProps={ planTypeSelectorProps }
		/>
	);

	return (
		<div
			className={ classNames( 'plans-features-main__group', 'is-wpcom', 'is-2023-pricing-grid', {
				'is-scrollable': plansWithScroll,
			} ) }
			data-e2e-plans="wpcom"
		>
			{ asyncPlanFeatures2023Grid }
		</div>
	);
};

const PlansFeaturesMain = ( {
	paidDomainName,
	freeSubdomain: signupFlowSubdomain,
	siteTitle,
	signupFlowUserName,
	flowName,
	removePaidDomain,
	setSiteUrlAsFreeDomainSuggestion,
	onUpgradeClick,
	hidePlanTypeSelector,
	redirectToAddDomainFlow,
	siteId,
	selectedPlan,
	basePlansPath,
	selectedFeature,
	plansWithScroll,
	withDiscount,
	discountEndDate,
	hideFreePlan,
	hidePersonalPlan,
	hidePremiumPlan,
	hideBusinessPlan,
	hideEcommercePlan,
	hideEnterprisePlan,
	intent: intentFromProps, // do not set a default value for this prop here
	isReskinned,
	showBiennialToggle,
	customerType = 'personal',
	planTypeSelector = 'interval',
	intervalType = 'yearly',
	hidePlansFeatureComparison = false,
	hideUnavailableFeatures = false,
	isInSignup = false,
	isPlansInsideStepper = false,
	isStepperUpgradeFlow = false,
	isLaunchPage = false,
	showLegacyStorageFeature = false,
	isSpotlightOnCurrentPlan,
}: PlansFeaturesMainProps ) => {
	const [ isFreePlanPaidDomainDialogOpen, setIsFreePlanPaidDomainDialogOpen ] = useState( false );
	const [ isFreeFreeUpsellOpen, setIsFreeFreeUpsellOpen ] = useState( false );
	const currentPlan = useSelector( ( state: IAppState ) => getCurrentPlan( state, siteId ) );
	const eligibleForWpcomMonthlyPlans = useSelector( ( state: IAppState ) =>
		isEligibleForWpComMonthlyPlan( state, siteId )
	);
	const siteSlug = useSelector( ( state: IAppState ) => getSiteSlug( state, siteId ) );
	const sitePlanSlug = useSelector( ( state: IAppState ) =>
		siteId ? getSitePlanSlug( state, siteId ) : null
	);
	const userCanUpgradeToPersonalPlan = useSelector(
		( state: IAppState ) => siteId && canUpgradeToPlan( state, siteId, PLAN_PERSONAL )
	);
	const previousRoute = useSelector( ( state: IAppState ) => getPreviousRoute( state ) );
	const isCustomDomainAllowedOnFreePlan = useIsCustomDomainAllowedOnFreePlan(
		flowName,
		paidDomainName
	);
	const isPlanUpsellEnabledOnFreeDomain = useIsPlanUpsellEnabledOnFreeDomain( flowName );

	let _customerType = chooseDefaultCustomerType( {
		currentCustomerType: customerType,
		selectedPlan,
		currentPlan: { productSlug: currentPlan?.productSlug },
	} );
	// Make sure the plans for the default customer type can be purchased.
	if ( _customerType === 'personal' && userCanUpgradeToPersonalPlan ) {
		_customerType = 'business';
	}

	const isDisplayingPlansNeededForFeature = () => {
		if (
			selectedFeature &&
			isValidFeatureKey( selectedFeature ) &&
			selectedPlan &&
			getPlan( selectedPlan ) &&
			! isPersonalPlan( selectedPlan ) &&
			( 'interval' === planTypeSelector || ! previousRoute.startsWith( '/plans/' ) )
		) {
			return true;
		}

		return false;
	};

	const toggleIsFreePlanPaidDomainDialogOpen = () => {
		setIsFreePlanPaidDomainDialogOpen( ! isFreePlanPaidDomainDialogOpen );
	};

	const handleUpgradeClick = ( cartItemForPlan?: { product_slug: string } | null ) => {
		// `cartItemForPlan` is empty if Free plan is selected. Show `FreePlanPaidDomainDialog`
		// in that case and exit. `FreePlanPaidDomainDialog` takes over from there.
		// It only applies to main onboarding flow and the paid media flow at the moment.
		// Standardizing it or not is TBD; see Automattic/growth-foundations#63 and pdgrnI-2nV-p2#comment-4110 for relevant discussion.
		if ( ! cartItemForPlan ) {
			/**
			 * Delay showing modal until the experiments have loaded
			 */
			if (
				isCustomDomainAllowedOnFreePlan.isLoading ||
				isPlanUpsellEnabledOnFreeDomain.isLoading
			) {
				return;
			}

			/**
			 * After the experiments are loaded now open the relevant modal based on previous step parameters
			 */
			if ( paidDomainName ) {
				toggleIsFreePlanPaidDomainDialogOpen();
				return;
			}
			if ( isPlanUpsellEnabledOnFreeDomain.result ) {
				setIsFreeFreeUpsellOpen( true );
				return;
			}
		}

		if ( onUpgradeClick ) {
			onUpgradeClick( cartItemForPlan );
			return;
		}

		const planPath = cartItemForPlan?.product_slug
			? getPlanPath( cartItemForPlan.product_slug )
			: '';
		const checkoutUrlWithArgs = `/checkout/${ siteSlug }/${ planPath }`;

		page( checkoutUrlWithArgs );
	};

	const term = usePlanBillingPeriod( {
		intervalType,
		...( selectedPlan ? { defaultValue: getPlan( selectedPlan )?.term } : {} ),
	} );
	const intentFromSiteMeta = usePlanIntentFromSiteMeta();
	const planFromUpsells = usePlanFromUpsells();
	// plans from upsells takes precedence for setting intent, globally
	const intent = planFromUpsells
		? 'plans-default-wpcom'
		: intentFromProps || intentFromSiteMeta.intent || 'plans-default-wpcom';

	// TODO clk: these should be reindexed to respect planRecordsWithIntent in the order defined
	// - depending on final form. works by maintaining an ordered index on default plans for now
	const defaultPlanRecords = usePlansWithIntent( {
		intent: 'default',
		selectedPlan,
		sitePlanSlug,
		hideEnterprisePlan,
		term,
		usePlanUpgradeabilityCheck,
	} );
	const planRecordsWithIntent = usePlansWithIntent( {
		intent,
		selectedPlan,
		sitePlanSlug,
		hideEnterprisePlan,
		term,
		usePlanUpgradeabilityCheck,
	} );
	const visiblePlans =
		useFilterPlansForPlanFeatures( {
			plans: planRecordsWithIntent,
			isDisplayingPlansNeededForFeature: isDisplayingPlansNeededForFeature(),
			selectedPlan,
			hideFreePlan,
			hidePersonalPlan,
			hidePremiumPlan,
			hideBusinessPlan,
			hideEcommercePlan,
		} ) || null;
	// merge/update default plans with plans with intent
	const gridPlanRecords = {
		...defaultPlanRecords,
		...visiblePlans,
	};

	// If advertising plans for a certain feature, ensure user has pressed "View all plans" before they can see others
	let hidePlanSelector = 'customer' === planTypeSelector && isDisplayingPlansNeededForFeature();
	// In the "purchase a plan and free domain" flow we do not want to show
	// monthly plans because monthly plans do not come with a free domain.
	if ( redirectToAddDomainFlow !== undefined || hidePlanTypeSelector ) {
		hidePlanSelector = true;
	}
	const currentUserName = useSelector( getCurrentUserName );
	const { wpcomFreeDomainSuggestion, invalidateDomainSuggestionCache } =
		useGetFreeSubdomainSuggestion(
			paidDomainName || siteTitle || signupFlowUserName || currentUserName
		);
	const resolvedSubdomainName: DataResponse< string > = {
		isLoading: signupFlowSubdomain ? false : wpcomFreeDomainSuggestion.isLoading,
		result: signupFlowSubdomain
			? signupFlowSubdomain
			: wpcomFreeDomainSuggestion.result?.domain_name,
	};

	const planTypeSelectorProps = {
		basePlansPath,
		isStepperUpgradeFlow,
		isInSignup,
		eligibleForWpcomMonthlyPlans,
		isPlansInsideStepper,
		intervalType,
		customerType: _customerType,
		siteSlug,
		selectedPlan,
		selectedFeature,
		showBiennialToggle,
		kind: planTypeSelector,
		plans: Object.keys( visiblePlans ),
	};

	const showUpgradeableStorage = config.isEnabled( 'plans/upgradeable-storage' );

	return (
		<div
			className={ classNames( 'plans-features-main', 'is-pricing-grid-2023-plans-features-main' ) }
		>
			<QueryPlans />
			<QuerySites siteId={ siteId } />
			<QuerySitePlans siteId={ siteId } />
			{ paidDomainName && isFreePlanPaidDomainDialogOpen && (
				<FreePlanPaidDomainDialog
					paidDomainName={ paidDomainName }
					wpcomFreeDomainSuggestion={ wpcomFreeDomainSuggestion }
					suggestedPlanSlug={ PLAN_PERSONAL }
					isCustomDomainAllowedOnFreePlan={ isCustomDomainAllowedOnFreePlan }
					onClose={ toggleIsFreePlanPaidDomainDialogOpen }
					onFreePlanSelected={ () => {
						if ( isCustomDomainAllowedOnFreePlan.isLoading ) {
							return;
						}

						if ( ! isCustomDomainAllowedOnFreePlan.result ) {
							removePaidDomain?.();
						}
						// Since this domain will not be available after it is selected, invalidate the cache.
						invalidateDomainSuggestionCache();
						wpcomFreeDomainSuggestion.result &&
							setSiteUrlAsFreeDomainSuggestion?.( wpcomFreeDomainSuggestion.result );
						onUpgradeClick?.( null );
					} }
					onPlanSelected={ () => {
						const cartItemForPlan = getCartItemForPlan( PLAN_PERSONAL );
						onUpgradeClick?.( cartItemForPlan );
					} }
				/>
			) }
			{ isFreeFreeUpsellOpen && (
				<FreePlanFreeDomainDialog
					suggestedPlanSlug={ PLAN_PERSONAL }
					freeSubdomain={ resolvedSubdomainName }
					onClose={ () => setIsFreeFreeUpsellOpen( false ) }
					onFreePlanSelected={ () => {
						if ( ! signupFlowSubdomain && wpcomFreeDomainSuggestion.result ) {
							setSiteUrlAsFreeDomainSuggestion?.( wpcomFreeDomainSuggestion.result );
						}
						invalidateDomainSuggestionCache();
						onUpgradeClick?.( null );
					} }
					onPlanSelected={ () => {
						if ( ! signupFlowSubdomain && wpcomFreeDomainSuggestion.result ) {
							setSiteUrlAsFreeDomainSuggestion?.( wpcomFreeDomainSuggestion.result );
						}
						invalidateDomainSuggestionCache();
						const cartItemForPlan = getCartItemForPlan( PLAN_PERSONAL );
						onUpgradeClick?.( cartItemForPlan );
					} }
				/>
			) }
			{ siteId && (
				<PlanNotice
					visiblePlans={ Object.keys( visiblePlans ) as PlanSlug[] }
					siteId={ siteId }
					isInSignup={ isInSignup }
					{ ...( withDiscount &&
						discountEndDate && {
							discountInformation: {
								withDiscount,
								discountEndDate,
							},
						} ) }
				/>
			) }
			{ isDisplayingPlansNeededForFeature() && <SecondaryFormattedHeader siteSlug={ siteSlug } /> }
			{ ! intentFromSiteMeta.processing && (
				<>
					{ ! hidePlanSelector && <PlanTypeSelector { ...planTypeSelectorProps } /> }
					<OnboardingPricingGrid2023
						planRecords={ gridPlanRecords }
						visiblePlans={ Object.keys( visiblePlans ) as PlanSlug[] }
						paidDomainName={ paidDomainName }
						wpcomFreeDomainSuggestion={ wpcomFreeDomainSuggestion }
						isInSignup={ isInSignup }
						isLaunchPage={ isLaunchPage }
						flowName={ flowName }
						onUpgradeClick={ handleUpgradeClick }
						selectedFeature={ selectedFeature }
						selectedPlan={ selectedPlan }
						withDiscount={ withDiscount }
						discountEndDate={ discountEndDate }
						siteId={ siteId }
						plansWithScroll={ plansWithScroll }
						isReskinned={ isReskinned }
						intervalType={ intervalType }
						planTypeSelectorProps={ planTypeSelectorProps }
						hidePlansFeatureComparison={ hidePlansFeatureComparison }
						hideUnavailableFeatures={ hideUnavailableFeatures }
						sitePlanSlug={ sitePlanSlug }
						siteSlug={ siteSlug }
						intent={ intent }
						isCustomDomainAllowedOnFreePlan={ isCustomDomainAllowedOnFreePlan }
						showLegacyStorageFeature={ showLegacyStorageFeature }
						isSpotlightOnCurrentPlan={ isSpotlightOnCurrentPlan }
						showUpgradeableStorage={ showUpgradeableStorage }
					/>
				</>
			) }
		</div>
	);
};

export default localize( PlansFeaturesMain );
