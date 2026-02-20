import config from '@automattic/calypso-config';
import {
	chooseDefaultCustomerType,
	getPlan,
	isFreePlan,
	isPersonalPlan,
	PLAN_PERSONAL,
	PLAN_FREE,
	type PlanSlug,
	type UrlFriendlyTermType,
	isValidFeatureKey,
	getFeaturesList,
	isWooExpressPlan,
	getPlanFeaturesGroupedForFeaturesGrid,
	getWooExpressFeaturesGroupedForComparisonGrid,
	getPlanFeaturesGroupedForComparisonGrid,
	getWooExpressFeaturesGroupedForFeaturesGrid,
	getWooHostedFeaturesGroupedForFeaturesGrid,
	getWooHostedFeaturesGroupedForComparisonGrid,
	getSimplifiedPlanFeaturesGroupedForFeaturesGrid,
	getWordPressHostingFeaturesGroupedForFeaturesGrid,
	isWooHostedPlan,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button, Spinner } from '@automattic/components';
import { WpcomPlansUI, AddOns, Plans } from '@automattic/data-stores';
import { isAnyHostingFlow } from '@automattic/onboarding';
import {
	FeaturesGrid,
	ComparisonGrid,
	PlanTypeSelector,
	useGridPlansForFeaturesGrid,
	useGridPlansForComparisonGrid,
	useGridPlanForSpotlight,
	usePlanBillingPeriod,
} from '@automattic/plans-grid-next';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import styled from '@emotion/styled';
import { useDispatch } from '@wordpress/data';
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from '@wordpress/element';
import { hasQueryArg } from '@wordpress/url';
import clsx from 'clsx';
import { localize, useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import QueryActivePromotions from 'calypso/components/data/query-active-promotions';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySites from 'calypso/components/data/query-sites';
import { retargetViewPlans } from 'calypso/lib/analytics/ad-tracking';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { planItem as getCartItemForPlan } from 'calypso/lib/cart-values/cart-items';
import scrollIntoViewport from 'calypso/lib/scroll-into-viewport';
import PlanNotice from 'calypso/my-sites/plans-features-main/components/plan-notice';
import {
	shouldForceDefaultPlansBasedOnIntent,
	hideEscapeHatchForIntent,
	ensureCompatibleIntervalType,
} from 'calypso/my-sites/plans-features-main/components/utils/utils';
import { useFreeTrialPlanSlugs } from 'calypso/my-sites/plans-features-main/hooks/use-free-trial-plan-slugs';
import usePlanDifferentiatorsExperiment from 'calypso/my-sites/plans-features-main/hooks/use-plan-differentiators-experiment';
import usePlanTypeDestinationCallback from 'calypso/my-sites/plans-features-main/hooks/use-plan-type-destination-callback';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import canUpgradeToPlan from 'calypso/state/selectors/can-upgrade-to-plan';
import getDomainFromHomeUpsellInQuery from 'calypso/state/selectors/get-domain-from-home-upsell-in-query';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import isDomainOnlySiteSelector from 'calypso/state/selectors/is-domain-only-site';
import isEligibleForWpComMonthlyPlan from 'calypso/state/selectors/is-eligible-for-wpcom-monthly-plan';
import { isUserEligibleForFreeHostingTrial } from 'calypso/state/selectors/is-user-eligible-for-free-hosting-trial';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import ComparisonGridToggle from './components/comparison-grid-toggle';
import PlanUpsellModal from './components/plan-upsell-modal';
import { useModalResolutionCallback } from './components/plan-upsell-modal/hooks/use-modal-resolution-callback';
import PlansPageSubheader from './components/plans-page-subheader';
import useCheckPlanAvailabilityForPurchase from './hooks/use-check-plan-availability-for-purchase';
import useDefaultWpcomPlansIntent from './hooks/use-default-wpcom-plans-intent';
import useFilteredDisplayedIntervals from './hooks/use-filtered-displayed-intervals';
import useGenerateActionHook from './hooks/use-generate-action-hook';
import usePlanFromUpsells from './hooks/use-plan-from-upsells';
import usePlanIntentFromSiteMeta from './hooks/use-plan-intent-from-site-meta';
import { useRenewalPricingExperiment } from './hooks/use-renewal-price-experiment';
import useSelectedFeature from './hooks/use-selected-feature';
import useGetFreeSubdomainSuggestion from './hooks/use-suggested-free-domain-from-paid-domain';
import type {
	PlansIntent,
	DataResponse,
	SupportedUrlFriendlyTermType,
} from '@automattic/plans-grid-next';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import type { IAppState } from 'calypso/state/types';
import './style.scss';
const PlanComparisonHeader = styled.h1`
	.plans .step-container .step-container__content &&,
	&& {
		font-size: 2rem;
		text-align: center;
		margin: 48px 0;
	}
`;
export interface PlansFeaturesMainProps {
	siteId?: number | null;
	intent?: PlansIntent | null;
	isInSiteDashboard?: boolean;
	isInSignup?: boolean;
	isCustomDomainAllowedOnFreePlan?: boolean;
	plansWithScroll?: boolean;
	customerType?: string;
	basePlansPath?: string;
	selectedPlan?: PlanSlug;
	selectedFeature?: string;
	onUpgradeClick?: ( cartItems?: MinimalRequestCartProduct[] | null ) => void;
	redirectToAddDomainFlow?: boolean;
	hidePlanTypeSelector?: boolean;
	paidDomainName?: string;
	freeSubdomain?: string;
	siteTitle?: string;
	signupFlowUserName?: string;
	flowName?: string | null;
	removePaidDomain?: () => void;
	setSiteUrlAsFreeDomainSuggestion?: ( freeDomainSuggestion: { domain_name: string } ) => void;
	isDomainTransfer?: boolean;
	intervalType?: Extract< UrlFriendlyTermType, 'monthly' | 'yearly' | '2yearly' | '3yearly' >;
	/**
	 * An array of intervals to be displayed in the plan type selector. Defaults to [ 'yearly', '2yearly', '3yearly', 'monthly' ]
	 */
	displayedIntervals?: Array<
		Extract< UrlFriendlyTermType, 'monthly' | 'yearly' | '2yearly' | '3yearly' >
	>;
	planTypeSelector?: 'interval';
	discountEndDate?: Date;
	hidePlansFeatureComparison?: boolean;
	coupon?: string;

	/**
	 * @deprecated use intent mechanism instead
	 */
	hideFreePlan?: boolean;

	/**
	 * @deprecated use intent mechanism instead
	 */
	hidePersonalPlan?: boolean;

	/**
	 * @deprecated use intent mechanism instead
	 */
	hidePremiumPlan?: boolean;

	/**
	 * @deprecated use intent mechanism instead
	 */
	hideBusinessPlan?: boolean;

	/**
	 * @deprecated use intent mechanism instead
	 */
	hideEcommercePlan?: boolean;

	/**
	 * @deprecated use intent mechanism instead
	 */
	hideEnterprisePlan?: boolean;
	isStepperUpgradeFlow?: boolean;
	isLaunchPage?: boolean | null;
	hideUnavailableFeatures?: boolean; // used to hide features that are not available, instead of strike-through as explained in #76206
	showLegacyStorageFeature?: boolean;
	isSpotlightOnCurrentPlan?: boolean;
	renderSiblingWhenLoaded?: () => ReactNode; // renders additional components as last dom node when plans grid dependecies are fully loaded
	/**
	 * Shows the plan type selector dropdown instead of the default toggle
	 */
	showPlanTypeSelectorDropdown?: boolean;
	onPlanIntervalUpdate?: ( path: string ) => void;

	/*
	 * Shows the free plan as a plain text anchor instead of a plan card.
	 * It's outside of the intent system since it is about the way the Free plan is presented, not the plan mix available to choose.
	 */
	deemphasizeFreePlan?: boolean;

	selectedThemeType?: string;
}

const PlansFeaturesMain = ( {
	paidDomainName,
	freeSubdomain: signupFlowSubdomain,
	siteTitle,
	signupFlowUserName,
	flowName,
	removePaidDomain,
	setSiteUrlAsFreeDomainSuggestion,
	isDomainTransfer,
	onUpgradeClick,
	hidePlanTypeSelector,
	redirectToAddDomainFlow,
	siteId,
	selectedPlan,
	basePlansPath,
	selectedFeature,
	plansWithScroll,
	discountEndDate,
	hideFreePlan,
	hidePersonalPlan,
	hidePremiumPlan,
	hideBusinessPlan,
	hideEcommercePlan,
	hideEnterprisePlan,
	intent: intentFromProps, // do not set a default value for this prop here
	displayedIntervals = [ 'yearly', '2yearly', '3yearly', 'monthly' ],
	customerType = 'personal',
	planTypeSelector = 'interval',
	intervalType = 'yearly',
	hidePlansFeatureComparison = false,
	hideUnavailableFeatures = false,
	isInSiteDashboard = false,
	isInSignup = false,
	isCustomDomainAllowedOnFreePlan = false,
	isStepperUpgradeFlow = false,
	isLaunchPage = false,
	showLegacyStorageFeature = false,
	deemphasizeFreePlan,
	isSpotlightOnCurrentPlan,
	renderSiblingWhenLoaded,
	showPlanTypeSelectorDropdown = false,
	coupon,
	onPlanIntervalUpdate,
	selectedThemeType,
}: PlansFeaturesMainProps ) => {
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	// TODO: Remove temporary eslint disable
	// eslint-disable-next-line
	const [ lastClickedPlan, setLastClickedPlan ] = useState< string | null >( null );
	const [ showPlansComparisonGrid, setShowPlansComparisonGrid ] = useState( false );
	const translate = useTranslate();
	const currentPlan = Plans.useCurrentPlan( { siteId } );

	const [ isRenewalPricingExperimentLoading, renewalPricingVariation ] =
		useRenewalPricingExperiment( flowName );

	const eligibleForWpcomMonthlyPlans = useSelector( ( state: IAppState ) =>
		isEligibleForWpComMonthlyPlan( state, siteId )
	);
	const siteSlug = useSelector( ( state: IAppState ) => getSiteSlug( state, siteId ) );
	const sitePlanSlug = currentPlan?.productSlug;
	const userCanUpgradeToPersonalPlan = useSelector(
		( state: IAppState ) => siteId && canUpgradeToPlan( state, siteId, PLAN_PERSONAL )
	);
	const previousRoute = useSelector( ( state: IAppState ) => getPreviousRoute( state ) );
	const { setShowDomainUpsellDialog } = useDispatch( WpcomPlansUI.store );
	const domainFromHomeUpsellFlow = useSelector( getDomainFromHomeUpsellInQuery );
	const showUpgradeableStorage = config.isEnabled( 'plans/upgradeable-storage' );
	const getPlanTypeDestination = usePlanTypeDestinationCallback();

	const resolveModal = useModalResolutionCallback( {
		isCustomDomainAllowedOnFreePlan,
		flowName,
		paidDomainName,
		intent: intentFromProps,
		selectedThemeType,
	} );

	const toggleShowPlansComparisonGrid = () => {
		if ( ! showPlansComparisonGrid ) {
			recordTracksEvent( 'calypso_signup_onboarding_plans_compare_all' );
		}

		setShowPlansComparisonGrid( ! showPlansComparisonGrid );
	};

	const showDomainUpsellDialog = useCallback( () => {
		setShowDomainUpsellDialog( true );
	}, [ setShowDomainUpsellDialog ] );
	const currentUserName = useSelector( getCurrentUserName );
	const { wpcomFreeDomainSuggestion, invalidateDomainSuggestionCache } =
		useGetFreeSubdomainSuggestion(
			paidDomainName || siteTitle || signupFlowUserName || currentUserName
		);

	const resolvedSubdomainName: DataResponse< { domain_name: string } > = useMemo( () => {
		return {
			isLoading: signupFlowSubdomain ? false : wpcomFreeDomainSuggestion.isLoading,
			result: signupFlowSubdomain
				? { domain_name: signupFlowSubdomain }
				: wpcomFreeDomainSuggestion.result,
		};
	}, [ signupFlowSubdomain, wpcomFreeDomainSuggestion ] );

	const filteredDisplayedIntervals = useFilteredDisplayedIntervals( {
		productSlug: currentPlan?.productSlug,
		displayedIntervals,
		flowName,
		paidDomainName,
	} );

	// Ensure intervalType is compatible with the current plan's term
	// Users can only select interval types that are equal to or longer than their current plan's interval
	// Only apply this fix in the plan-upgrade flow to avoid breaking other flows
	const currentPlanTerm =
		isStepperUpgradeFlow && sitePlanSlug ? getPlan( sitePlanSlug )?.term : null;
	const compatibleIntervalType = useMemo(
		() => ensureCompatibleIntervalType( currentPlanTerm, intervalType ),
		[ currentPlanTerm, intervalType ]
	);

	const term = usePlanBillingPeriod( {
		intervalType: compatibleIntervalType,
		...( selectedPlan ? { defaultValue: getPlan( selectedPlan )?.term } : {} ),
	} );

	const intentFromSiteMeta = usePlanIntentFromSiteMeta();
	const planFromUpsells = usePlanFromUpsells();
	const defaultWpcomPlansIntent = useDefaultWpcomPlansIntent();
	const [ forceDefaultPlans, setForceDefaultPlans ] = useState( false );
	const [ intent, setIntent ] = useState< PlansIntent | undefined >( undefined );
	/**
	 * Keep the `useEffect` here strictly about intent resolution.
	 * This is fairly critical logic and may generate side effects if not handled properly.
	 * Let's be especially deliberate about making changes.
	 */
	useEffect( () => {
		if ( intentFromSiteMeta.processing ) {
			return;
		}

		// TODO: plans from upsell takes precedence for setting intent right now
		// - this is currently set to the default wpcom set until we have updated tailored features for all plans
		// - at which point, we'll inject the upsell plan to the tailored plans mix instead
		if ( defaultWpcomPlansIntent !== intent && forceDefaultPlans ) {
			setIntent( defaultWpcomPlansIntent );
		} else {
			const resolvedIntent = planFromUpsells
				? defaultWpcomPlansIntent
				: intentFromProps || intentFromSiteMeta.intent || defaultWpcomPlansIntent;

			// Always update intent when intent is not set.
			// When the escape hatch is used (forceDefaultPlans), do not override with intentFromProps.
			if ( ! intent || ( ! forceDefaultPlans && intentFromProps !== intent ) ) {
				setIntent( resolvedIntent );
			}
		}
	}, [
		intent,
		intentFromProps,
		intentFromSiteMeta.intent,
		planFromUpsells,
		forceDefaultPlans,
		intentFromSiteMeta.processing,
		defaultWpcomPlansIntent,
	] );

	const isDisplayingPlansNeededForFeature =
		!! selectedFeature &&
		// For plans-upgrade intent, skip isValidFeatureKey check since we want to check against "included" features
		// that may not be in the feature key list (e.g. because they're grouped into a broader feature).
		( intent === 'plans-upgrade' ||
			( isValidFeatureKey( selectedFeature ) &&
				!! selectedPlan &&
				!! getPlan( selectedPlan ) &&
				! isPersonalPlan( selectedPlan ) &&
				( 'interval' === planTypeSelector || ! previousRoute.startsWith( '/plans/' ) ) ) );

	const showEscapeHatch =
		intentFromSiteMeta.intent &&
		! isInSignup &&
		defaultWpcomPlansIntent !== intent &&
		! hideEscapeHatchForIntent( intentFromSiteMeta.intent );

	/**
	 * showSimplifiedFeatures should be true always and this variable should be removed.
	 * It exists temporarily till the flows with the following intents are removed.
	 */
	const showSimplifiedFeatures = ! (
		intent && [ 'plans-newsletter', 'plans-blog-onboarding' ].includes( intent )
	);

	const {
		isLoading: isLoadingDifferentiatorsExperiment,
		showDifferentiatorHeader,
		variant: differentiatorsVariant,
		useVar1Features,
		useVar3Features,
		useVar4Features,
		useVar5Features,
		isVar1dVariant,
		isVar4Variant,
		isExperimentVariant,
	} = usePlanDifferentiatorsExperiment( { flowName, isInSignup, siteId } );

	const eligibleForFreeHostingTrial = useSelector( isUserEligibleForFreeHostingTrial );

	// TODO: We should move the modal logic into a data store
	const showModalAndExit = ( planSlug: PlanSlug ): boolean => {
		if (
			sitePlanSlug &&
			isFreePlan( sitePlanSlug ) &&
			domainFromHomeUpsellFlow &&
			intentFromProps !== 'plans-p2'
		) {
			showDomainUpsellDialog();
			return true;
		}

		setLastClickedPlan( planSlug );

		const displayedModal = resolveModal( planSlug );
		if ( displayedModal ) {
			setIsModalOpen( true );
			return true;
		}

		return false;
	};

	const useAction = useGenerateActionHook( {
		siteId,
		cartHandler: onUpgradeClick,
		flowName,
		plansIntent: intent,
		isInSignup,
		isLaunchPage,
		showModalAndExit,
		coupon,
		useCheckPlanAvailabilityForPurchase,
		showBillingDescriptionForIncreasedRenewalPrice: renewalPricingVariation,
		enableCategorisedFeatures: showSimplifiedFeatures,
		reflectStorageSelectionInPlanPrices: true,
		isGatingBusinessQ1: !! differentiatorsVariant,
	} );

	const isDomainOnlySite = useSelector( ( state: IAppState ) =>
		siteId ? !! isDomainOnlySiteSelector( state, siteId ) : false
	);

	const hiddenPlans = {
		hideFreePlan,
		hidePersonalPlan,
		hidePremiumPlan,
		hideBusinessPlan,
		hideEcommercePlan,
		hideEnterprisePlan,
	};

	// we need all the plans that are available to pick for comparison grid (these should extend into plans-ui data store selectors)
	const gridPlansForComparisonGrid = useGridPlansForComparisonGrid( {
		allFeaturesList: getFeaturesList(),
		coupon,
		eligibleForFreeHostingTrial,
		hasRedeemedDomainCredit: currentPlan?.hasRedeemedDomainCredit,
		hiddenPlans,
		intent: shouldForceDefaultPlansBasedOnIntent( intent ) ? defaultWpcomPlansIntent : intent,
		isDisplayingPlansNeededForFeature,
		isSubdomainNotGenerated: ! resolvedSubdomainName.result,
		selectedFeature,
		selectedPlan,
		showLegacyStorageFeature,
		siteId,
		term,
		useCheckPlanAvailabilityForPurchase,
		useFreeTrialPlanSlugs,
		isDomainOnlySite,
		reflectStorageSelectionInPlanPrices: true,
		isInSignup,
		useLongSetFeatures: useVar4Features,
		useLongSetStackedFeatures: useVar3Features,
		useShortSetStackedFeatures: useVar1Features,
		useVar5Features,
		isExperimentVariant,
		isVar1dVariant,
	} );

	// we need only the visible ones for features grid (these should extend into plans-ui data store selectors)
	const gridPlansForFeaturesGridRaw = useGridPlansForFeaturesGrid( {
		allFeaturesList: getFeaturesList(),
		coupon,
		eligibleForFreeHostingTrial,
		hasRedeemedDomainCredit: currentPlan?.hasRedeemedDomainCredit,
		hiddenPlans,
		hideCurrentPlan: isInSiteDashboard,
		intent,
		isDisplayingPlansNeededForFeature,
		isInSignup,
		isSubdomainNotGenerated: ! resolvedSubdomainName.result,
		selectedFeature,
		selectedPlan,
		showLegacyStorageFeature,
		siteId,
		useCheckPlanAvailabilityForPurchase,
		useFreeTrialPlanSlugs,
		isDomainOnlySite,
		term,
		reflectStorageSelectionInPlanPrices: true,
		useLongSetFeatures: useVar4Features,
		useLongSetStackedFeatures: useVar3Features,
		useShortSetStackedFeatures: useVar1Features,
		useVar5Features,
		isExperimentVariant,
		isVar1dVariant,
	} );

	// when `deemphasizeFreePlan` is enabled, the Free plan will be presented as a CTA link instead of a plan card in the features grid.
	const gridPlansForFeaturesGrid = useMemo(
		() =>
			gridPlansForFeaturesGridRaw?.filter( ( { planSlug } ) => {
				if ( deemphasizeFreePlan ) {
					return planSlug !== PLAN_FREE;
				}

				return true;
			} ) ?? null, // optional chaining can result in `undefined`; we don't want to introduce it here.
		[ gridPlansForFeaturesGridRaw, deemphasizeFreePlan ]
	);

	const isVisualSplitEnabled =
		intent === 'plans-website-builder' || intent === 'plans-wordpress-hosting';
	// In some cases, the free plan is not an option at all. Make sure not to offer it in the subheader.
	// For website builder and wordpress hosting intents, we always want to offer the free plan even if it's not in the grid
	const offeringFreePlan =
		isVisualSplitEnabled ||
		gridPlansForFeaturesGridRaw?.some( ( { planSlug } ) => planSlug === PLAN_FREE );

	let hidePlanSelector = false;
	let enableTermSavingsPriceDisplay = true;
	// In the "purchase a plan and free domain" flow we do not want to show
	// monthly plans because monthly plans do not come with a free domain.
	if ( redirectToAddDomainFlow !== undefined || hidePlanTypeSelector || isVisualSplitEnabled ) {
		hidePlanSelector = true;
	}
	if ( ! isInSignup ) {
		enableTermSavingsPriceDisplay = false;
	}

	let _customerType = chooseDefaultCustomerType( {
		currentCustomerType: customerType,
		selectedPlan,
		currentPlan: { productSlug: currentPlan?.productSlug },
	} );
	// Make sure the plans for the default customer type can be purchased.
	if ( _customerType === 'personal' && userCanUpgradeToPersonalPlan ) {
		_customerType = 'business';
	}

	const planTypeSelectorProps = useMemo( () => {
		const props = {
			basePlansPath,
			isStepperUpgradeFlow,
			isInSignup,
			eligibleForWpcomMonthlyPlans,
			intervalType: compatibleIntervalType,
			customerType: _customerType,
			siteSlug,
			selectedPlan,
			selectedFeature,
			displayedIntervals: filteredDisplayedIntervals,
			showPlanTypeSelectorDropdown,
			kind: planTypeSelector,
			currentSitePlanSlug: sitePlanSlug,
			useCheckPlanAvailabilityForPurchase,
			recordTracksEvent,
			coupon,
			selectedSiteId: siteId,
			intent,
		};

		const handlePlanIntervalUpdate = ( interval: SupportedUrlFriendlyTermType ) => {
			let isJetpackAppFlow: string | null = '';

			if ( typeof window !== 'undefined' ) {
				isJetpackAppFlow = new URLSearchParams( window.location.search ).get( 'jetpackAppPlans' );
			}

			const pathOrQueryParam = getPlanTypeDestination( props, {
				intervalType: interval,
				jetpackAppPlans: isJetpackAppFlow,
			} );

			if ( onPlanIntervalUpdate ) {
				return onPlanIntervalUpdate( pathOrQueryParam );
			}

			if ( hasQueryArg( pathOrQueryParam, 'intervalType' ) ) {
				const currentPath = window.location.pathname;
				return page( currentPath + pathOrQueryParam );
			}

			page( pathOrQueryParam );
		};

		return {
			...props,
			onPlanIntervalUpdate: handlePlanIntervalUpdate,
		};
	}, [
		basePlansPath,
		isStepperUpgradeFlow,
		isInSignup,
		eligibleForWpcomMonthlyPlans,
		compatibleIntervalType,
		_customerType,
		siteSlug,
		selectedPlan,
		selectedFeature,
		filteredDisplayedIntervals,
		showPlanTypeSelectorDropdown,
		planTypeSelector,
		sitePlanSlug,
		coupon,
		siteId,
		getPlanTypeDestination,
		onPlanIntervalUpdate,
		intent,
	] );

	const gridPlansForPlanTypeSelector = gridPlansForFeaturesGrid?.map(
		( gridPlan ) => gridPlan.planSlug
	);

	const gridPlanForSpotlight = useGridPlanForSpotlight( {
		intent,
		isSpotlightOnCurrentPlan,
		gridPlans: gridPlansForFeaturesGrid,
		siteId,
	} );

	const [ masterbarHeight, setMasterbarHeight ] = useState( 0 );

	/**
	 * Calculates the height of the masterbar if it overlaps, and passes it to the component as an offset
	 * for the sticky CTA bar.
	 */
	useLayoutEffect( () => {
		if ( isInSiteDashboard ) {
			// The masterbar does not overlap with the site dashboard's scrollable content.
			return;
		}

		const masterbarElement = document.querySelector< HTMLDivElement >( 'header.masterbar' );

		if ( ! masterbarElement ) {
			return;
		}

		if ( ! window.ResizeObserver ) {
			setMasterbarHeight( masterbarElement.offsetHeight );
			return;
		}

		const observer = new ResizeObserver(
			( [ masterbar ]: Parameters< ResizeObserverCallback >[ 0 ] ) => {
				const currentHeight = masterbar.contentRect.height;

				if ( currentHeight !== masterbarHeight ) {
					setMasterbarHeight( currentHeight );
				}
			}
		);

		observer.observe( masterbarElement );

		return () => {
			observer.disconnect();
		};
	}, [] );

	const plansComparisonGridRef = useRef< HTMLDivElement >( null );
	/**
	 * Scrolls the comparison grid smoothly into view when rendered.
	 */
	useLayoutEffect( () => {
		if ( showPlansComparisonGrid ) {
			setTimeout( () => {
				if ( plansComparisonGridRef.current ) {
					scrollIntoViewport( plansComparisonGridRef.current, {
						behavior: 'smooth',
						scrollMode: 'if-needed',
						block: 'nearest',
						inline: 'nearest',
					} );
				}
			} );
		}
	}, [ showPlansComparisonGrid ] );

	useEffect( () => {
		recordTracksEvent( 'calypso_wp_plans_test_view' );
		retargetViewPlans();
	}, [] );

	/**
	 * TODO: `handleStorageAddOnClick` no longer necessary. Tracking can be done from the grid components directly.
	 */
	const handleStorageAddOnClick = useCallback(
		( addOnSlug: AddOns.StorageAddOnSlug ) =>
			recordTracksEvent( 'calypso_signup_storage_add_on_dropdown_option_click', {
				add_on_slug: addOnSlug,
			} ),
		[]
	);

	const comparisonGridContainerClasses = clsx( 'plans-features-main__comparison-grid-container', {
		'is-hidden': ! showPlansComparisonGrid,
	} );

	const isLoadingGridPlans = Boolean(
		! intent ||
			! defaultWpcomPlansIntent || // this may be unnecessary, but just in case
			! gridPlansForFeaturesGrid ||
			! gridPlansForComparisonGrid
	);

	const isPlansGridReady =
		! isLoadingGridPlans &&
		! resolvedSubdomainName.isLoading &&
		! isRenewalPricingExperimentLoading &&
		! isLoadingDifferentiatorsExperiment;

	const isMobile = useMobileBreakpoint();
	const enablePlanTypeSelectorStickyBehavior = isMobile && showPlanTypeSelectorDropdown;
	const stickyPlanTypeSelectorHeight = isMobile ? 54 : 48;
	const comparisonGridStickyRowOffset = enablePlanTypeSelectorStickyBehavior
		? stickyPlanTypeSelectorHeight + masterbarHeight
		: masterbarHeight;

	const {
		primary: { callback: onFreePlanCTAClick },
	} = useAction( {
		planSlug: PLAN_FREE,
	} );

	// Check to see if we have at least one Woo Express plan we're comparing.
	const hasWooExpressFeatures = useMemo( () => {
		return gridPlansForComparisonGrid?.some(
			( { planSlug, isVisible } ) => isVisible && isWooExpressPlan( planSlug )
		);
	}, [ gridPlansForComparisonGrid ] );

	// Check to see if we have at least one Woo Hosted plan we're comparing.
	const hasWooHostedFeatures = useMemo( () => {
		return gridPlansForComparisonGrid?.some(
			( { planSlug, isVisible } ) => isVisible && isWooHostedPlan( planSlug )
		);
	}, [ gridPlansForComparisonGrid ] );

	// Determine feature groups for comparison grid
	let featureGroupMapForComparisonGrid;
	if ( hasWooHostedFeatures ) {
		featureGroupMapForComparisonGrid = getWooHostedFeaturesGroupedForComparisonGrid();
	} else if ( hasWooExpressFeatures ) {
		featureGroupMapForComparisonGrid = getWooExpressFeaturesGroupedForComparisonGrid();
	} else {
		featureGroupMapForComparisonGrid = getPlanFeaturesGroupedForComparisonGrid( {
			isExperimentVariant,
		} );
	}

	let featureGroupMapForFeaturesGrid;
	if ( hasWooHostedFeatures ) {
		featureGroupMapForFeaturesGrid = getWooHostedFeaturesGroupedForFeaturesGrid();
	} else if ( hasWooExpressFeatures ) {
		featureGroupMapForFeaturesGrid = getWooExpressFeaturesGroupedForFeaturesGrid();
	} else if ( intent === 'plans-wordpress-hosting' ) {
		featureGroupMapForFeaturesGrid = getWordPressHostingFeaturesGroupedForFeaturesGrid();
	} else if ( useVar3Features || useVar4Features || useVar1Features || useVar5Features ) {
		// Experiment: stacked variants should render a single, ordered list (no grouping),
		// otherwise features get scattered across groups causing gaps and can be filtered out.
		const featureGroups = getPlanFeaturesGroupedForFeaturesGrid();
		featureGroupMapForFeaturesGrid = Object.fromEntries(
			Object.entries( featureGroups ).reverse()
		);
	} else if ( showSimplifiedFeatures ) {
		featureGroupMapForFeaturesGrid = getSimplifiedPlanFeaturesGroupedForFeaturesGrid();
	} else {
		featureGroupMapForFeaturesGrid = getPlanFeaturesGroupedForFeaturesGrid();
	}

	const getComparisonGridToggleLabel = () => {
		if ( showPlansComparisonGrid ) {
			return translate( 'Hide comparison' );
		}
		return translate( 'Compare plans' );
	};

	const enterpriseFeaturesList = useMemo(
		() => [
			translate( 'Multifaceted security' ),
			translate( 'Generative AI' ),
			translate( 'Integrated content analytics' ),
			translate( '24/7 support' ),
			translate( 'FedRAMP certification' ),
			translate( 'API mesh and node hosting' ),
			translate( 'Containerized environment' ),
			translate( 'Global infrastructure' ),
			translate( 'Dynamic autoscaling' ),
			translate( 'Integrated CDN' ),
			translate( 'Integrated code repository' ),
			translate( 'Staging environments' ),
			translate( 'Management dashboard' ),
			translate( 'Command line interface (CLI)' ),
			translate( 'Efficient multi-site management' ),
			translate( 'Advanced access controls' ),
			translate( 'Single sign-on (SSO)' ),
			translate( 'DDoS protection and mitigation' ),
			translate( 'Plugin and theme vulnerability scanning' ),
			translate( 'Automated plugin upgrade' ),
			translate( 'Integrated enterprise search' ),
		],
		[ translate ]
	);

	const viewAllPlansButton = (
		<div className="plans-features-main__escape-hatch">
			<Button
				borderless
				onClick={ () => {
					setForceDefaultPlans( true );
				} }
			>
				{ translate( 'View all plans' ) }
			</Button>
		</div>
	);

	const selectedFeatureData = useSelectedFeature( {
		gridPlans: gridPlansForFeaturesGrid,
		selectedPlan,
		selectedFeature,
	} );

	return (
		<>
			<div className={ clsx( 'plans-features-main', 'is-pricing-grid-2023-plans-features-main' ) }>
				<QuerySites siteId={ siteId } />
				<QuerySitePlans siteId={ siteId } />
				<QueryActivePromotions />
				<QueryProductsList />
				<PlanUpsellModal
					isModalOpen={ isModalOpen }
					paidDomainName={ paidDomainName }
					modalType={ resolveModal( lastClickedPlan ) }
					generatedWPComSubdomain={ resolvedSubdomainName }
					selectedThemeType={ selectedThemeType }
					isDomainTransfer={ isDomainTransfer || false }
					onClose={ () => setIsModalOpen( false ) }
					onFreePlanSelected={ ( isDomainRetained ) => {
						if ( ! isDomainRetained ) {
							removePaidDomain?.();
						}
						// Since this domain will not be available after it is selected, invalidate the cache.
						invalidateDomainSuggestionCache();
						if ( resolvedSubdomainName.result?.domain_name ) {
							setSiteUrlAsFreeDomainSuggestion?.( resolvedSubdomainName.result );
						}
						onUpgradeClick?.( null );
					} }
					onPlanSelected={ ( planSlug ) => {
						if ( resolvedSubdomainName.result?.domain_name ) {
							setSiteUrlAsFreeDomainSuggestion?.( resolvedSubdomainName.result );
						}
						invalidateDomainSuggestionCache();
						const cartItemForPlan = getCartItemForPlan( planSlug );
						const cartItems = cartItemForPlan ? [ cartItemForPlan ] : null;
						onUpgradeClick?.( cartItems );
					} }
				/>
				{ siteId && gridPlansForFeaturesGrid && (
					<PlanNotice
						visiblePlans={ gridPlansForFeaturesGrid.map( ( gridPlan ) => gridPlan.planSlug ) }
						siteId={ siteId }
						isInSignup={ isInSignup }
						intent={ intent }
						{ ...( coupon &&
							discountEndDate && {
								discountInformation: {
									coupon,
									discountEndDate,
								},
							} ) }
					/>
				) }
				<PlansPageSubheader
					siteSlug={ siteSlug }
					isDisplayingPlansNeededForFeature={ isDisplayingPlansNeededForFeature }
					selectedFeature={ selectedFeatureData }
					offeringFreePlan={ offeringFreePlan }
					flowName={ flowName }
					deemphasizeFreePlan={ deemphasizeFreePlan }
					onFreePlanCTAClick={ onFreePlanCTAClick }
					intent={ intent }
					showDifferentiatorHeader={ showDifferentiatorHeader }
				/>
				{ ! isPlansGridReady && <Spinner size={ 30 } /> }
				{ isPlansGridReady && (
					<>
						{ ! hidePlanSelector && gridPlansForPlanTypeSelector && (
							<PlanTypeSelector
								{ ...planTypeSelectorProps }
								plans={ gridPlansForPlanTypeSelector }
								layoutClassName="plans-features-main__plan-type-selector-layout"
								enableStickyBehavior={ enablePlanTypeSelectorStickyBehavior }
								stickyPlanTypeSelectorOffset={ masterbarHeight - 1 }
								coupon={ coupon }
							/>
						) }
						<div
							className={ clsx( 'plans-features-main__group', 'is-wpcom', 'is-2023-pricing-grid', {
								'is-scrollable': plansWithScroll,
								'is-plan-type-selector-visible': ! hidePlanSelector,
								'is-visual-split-layout':
									intent === 'plans-website-builder' || intent === 'plans-wordpress-hosting',
							} ) }
							data-e2e-plans="wpcom"
						>
							<div className="plans-wrapper">
								{ gridPlansForFeaturesGrid && (
									<FeaturesGrid
										allFeaturesList={ getFeaturesList() }
										className={ `plans-features-main__features-grid${
											isExperimentVariant ? ' is-plan-differentiators-experiment' : ''
										}` }
										coupon={ coupon }
										currentSitePlanSlug={ sitePlanSlug }
										generatedWPComSubdomain={ resolvedSubdomainName }
										gridPlanForSpotlight={ gridPlanForSpotlight }
										gridPlans={ gridPlansForFeaturesGrid }
										hideUnavailableFeatures={ hideUnavailableFeatures }
										intent={ intent }
										isCustomDomainAllowedOnFreePlan={ isCustomDomainAllowedOnFreePlan }
										isInAdmin={ ! isInSignup }
										isInSiteDashboard={ isInSiteDashboard }
										isInSignup={ isInSignup }
										onStorageAddOnClick={ handleStorageAddOnClick }
										paidDomainName={ paidDomainName }
										recordTracksEvent={ recordTracksEvent }
										reflectStorageSelectionInPlanPrices
										selectedFeature={ selectedFeature }
										showLegacyStorageFeature={ showLegacyStorageFeature }
										showRefundPeriod={ isAnyHostingFlow( flowName ) }
										showUpgradeableStorage={ showUpgradeableStorage }
										siteId={ siteId }
										stickyRowOffset={ masterbarHeight }
										useCheckPlanAvailabilityForPurchase={ useCheckPlanAvailabilityForPurchase }
										useAction={ useAction }
										enableFeatureTooltips
										featureGroupMap={ featureGroupMapForFeaturesGrid }
										enterpriseFeaturesList={ enterpriseFeaturesList }
										enableShowAllFeaturesButton={ ! showSimplifiedFeatures }
										enableCategorisedFeatures={ showSimplifiedFeatures }
										enableStorageAsBadge={ ! showSimplifiedFeatures }
										enableReducedFeatureGroupSpacing={ showSimplifiedFeatures }
										enableLogosOnlyForEnterprisePlan={ showSimplifiedFeatures }
										hideFeatureGroupTitles={
											showSimplifiedFeatures && intent !== 'plans-wordpress-hosting'
										}
										enableTermSavingsPriceDisplay={ enableTermSavingsPriceDisplay }
										showSimplifiedBillingDescription={ isInSignup }
										showBillingDescriptionForIncreasedRenewalPrice={ renewalPricingVariation }
										isVar1dVariant={ isVar1dVariant }
										isVar4Variant={ isVar4Variant }
										isExperimentVariant={ isExperimentVariant }
									/>
								) }
								{ showEscapeHatch && hidePlansFeatureComparison && viewAllPlansButton }
								{ ! hidePlansFeatureComparison && (
									<>
										<ComparisonGridToggle
											onClick={ toggleShowPlansComparisonGrid }
											label={ getComparisonGridToggleLabel() }
										/>
										{ showEscapeHatch && viewAllPlansButton }
										<div
											ref={ plansComparisonGridRef }
											className={ comparisonGridContainerClasses }
										>
											<PlanComparisonHeader className="wp-brand-font">
												{ translate( 'Compare our plans and find yours' ) }
											</PlanComparisonHeader>
											{ ! hidePlanSelector &&
												showPlansComparisonGrid &&
												gridPlansForPlanTypeSelector &&
												! isMobile && (
													<PlanTypeSelector
														{ ...planTypeSelectorProps }
														plans={ gridPlansForPlanTypeSelector }
														layoutClassName="plans-features-main__plan-type-selector-layout"
														coupon={ coupon }
													/>
												) }
											{ gridPlansForComparisonGrid && gridPlansForPlanTypeSelector && (
												<ComparisonGrid
													allFeaturesList={ getFeaturesList() }
													className="plans-features-main__comparison-grid"
													coupon={ coupon }
													currentSitePlanSlug={ sitePlanSlug }
													gridPlans={ gridPlansForComparisonGrid }
													hideUnavailableFeatures={ hideUnavailableFeatures }
													intent={ intent }
													intervalType={ compatibleIntervalType }
													isInAdmin={ ! isInSignup }
													isInSiteDashboard={ isInSiteDashboard }
													isInSignup={ isInSignup }
													onStorageAddOnClick={ handleStorageAddOnClick }
													planTypeSelectorProps={
														! hidePlanSelector
															? { ...planTypeSelectorProps, plans: gridPlansForPlanTypeSelector }
															: undefined
													}
													recordTracksEvent={ recordTracksEvent }
													reflectStorageSelectionInPlanPrices
													selectedFeature={ selectedFeature }
													selectedPlan={ selectedPlan }
													showUpgradeableStorage={ showUpgradeableStorage }
													siteId={ siteId }
													stickyRowOffset={ comparisonGridStickyRowOffset }
													showRefundPeriod={ isAnyHostingFlow( flowName ) }
													useAction={ useAction }
													useCheckPlanAvailabilityForPurchase={
														useCheckPlanAvailabilityForPurchase
													}
													showBillingDescriptionForIncreasedRenewalPrice={ renewalPricingVariation }
													enableFeatureTooltips
													featureGroupMap={ featureGroupMapForComparisonGrid }
													enableTermSavingsPriceDisplay={ enableTermSavingsPriceDisplay }
													showSimplifiedBillingDescription={ isInSignup }
													isExperimentVariant={ isExperimentVariant }
												/>
											) }
											<ComparisonGridToggle
												onClick={ toggleShowPlansComparisonGrid }
												label={ translate( 'Hide comparison' ) }
											/>
											{ showEscapeHatch && viewAllPlansButton }
										</div>
									</>
								) }
							</div>
						</div>
					</>
				) }
			</div>
			{ isPlansGridReady && renderSiblingWhenLoaded?.() }
		</>
	);
};

export default localize( PlansFeaturesMain );
