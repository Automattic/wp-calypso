import config from '@automattic/calypso-config';
import {
	chooseDefaultCustomerType,
	getPlan,
	isFreePlan,
	isPersonalPlan,
	PLAN_PERSONAL,
	WPComStorageAddOnSlug,
	PLAN_FREE,
	type PlanSlug,
	UrlFriendlyTermType,
	isValidFeatureKey,
	getFeaturesList,
	isWooExpressPlan,
	PLAN_ECOMMERCE,
	getPlanFeaturesGroupedForFeaturesGrid,
	getWooExpressFeaturesGroupedForComparisonGrid,
	getPlanFeaturesGroupedForComparisonGrid,
	getWooExpressFeaturesGroupedForFeaturesGrid,
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
import { TranslateResult, localize, useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import QueryActivePromotions from 'calypso/components/data/query-active-promotions';
import QueryPlans from 'calypso/components/data/query-plans';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySites from 'calypso/components/data/query-sites';
import { retargetViewPlans } from 'calypso/lib/analytics/ad-tracking';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { planItem as getCartItemForPlan } from 'calypso/lib/cart-values/cart-items';
import { useExperiment } from 'calypso/lib/explat';
import scrollIntoViewport from 'calypso/lib/scroll-into-viewport';
import PlanNotice from 'calypso/my-sites/plans-features-main/components/plan-notice';
import { shouldForceDefaultPlansBasedOnIntent } from 'calypso/my-sites/plans-features-main/components/utils/utils';
import { useFreeTrialPlanSlugs } from 'calypso/my-sites/plans-features-main/hooks/use-free-trial-plan-slugs';
import usePlanTypeDestinationCallback from 'calypso/my-sites/plans-features-main/hooks/use-plan-type-destination-callback';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import canUpgradeToPlan from 'calypso/state/selectors/can-upgrade-to-plan';
import getDomainFromHomeUpsellInQuery from 'calypso/state/selectors/get-domain-from-home-upsell-in-query';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import isEligibleForWpComMonthlyPlan from 'calypso/state/selectors/is-eligible-for-wpcom-monthly-plan';
import { isUserEligibleForFreeHostingTrial } from 'calypso/state/selectors/is-user-eligible-for-free-hosting-trial';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import ComparisonGridToggle from './components/comparison-grid-toggle';
import PlanUpsellModal from './components/plan-upsell-modal';
import { useModalResolutionCallback } from './components/plan-upsell-modal/hooks/use-modal-resolution-callback';
import PlansPageSubheader from './components/plans-page-subheader';
import useCheckPlanAvailabilityForPurchase from './hooks/use-check-plan-availability-for-purchase';
import useExperimentForTrailMap from './hooks/use-experiment-for-trail-map';
import useFilteredDisplayedIntervals from './hooks/use-filtered-displayed-intervals';
import useGenerateActionHook from './hooks/use-generate-action-hook';
import usePlanBillingPeriod from './hooks/use-plan-billing-period';
import usePlanFromUpsells from './hooks/use-plan-from-upsells';
import usePlanIntentFromSiteMeta from './hooks/use-plan-intent-from-site-meta';
import { usePlanUpgradeCreditsApplicable } from './hooks/use-plan-upgrade-credits-applicable';
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
	intervalType?: Extract< UrlFriendlyTermType, 'monthly' | 'yearly' | '2yearly' | '3yearly' >;
	/**
	 * An array of intervals to be displayed in the plan type selector. Defaults to [ 'yearly', '2yearly', '3yearly', 'monthly' ]
	 */
	displayedIntervals?: Array<
		Extract< UrlFriendlyTermType, 'monthly' | 'yearly' | '2yearly' | '3yearly' >
	>;
	planTypeSelector?: 'interval';
	withDiscount?: string;
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
}

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
	displayedIntervals = [ 'yearly', '2yearly', '3yearly', 'monthly' ],
	customerType = 'personal',
	planTypeSelector = 'interval',
	intervalType = 'yearly',
	hidePlansFeatureComparison = false,
	hideUnavailableFeatures = false,
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
}: PlansFeaturesMainProps ) => {
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	// TODO: Remove temporary eslint disable
	// eslint-disable-next-line
	const [ lastClickedPlan, setLastClickedPlan ] = useState< string | null >( null );
	const [ showPlansComparisonGrid, setShowPlansComparisonGrid ] = useState( false );
	const translate = useTranslate();
	const storageAddOns = AddOns.useStorageAddOns( { siteId } );
	const currentPlan = Plans.useCurrentPlan( { siteId } );

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
	} );

	const toggleShowPlansComparisonGrid = () => {
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

	const isDisplayingPlansNeededForFeature =
		!! selectedFeature &&
		isValidFeatureKey( selectedFeature ) &&
		!! selectedPlan &&
		!! getPlan( selectedPlan ) &&
		! isPersonalPlan( selectedPlan ) &&
		( 'interval' === planTypeSelector || ! previousRoute.startsWith( '/plans/' ) );

	const term = usePlanBillingPeriod( {
		intervalType,
		...( selectedPlan ? { defaultValue: getPlan( selectedPlan )?.term } : {} ),
	} );

	const intentFromSiteMeta = usePlanIntentFromSiteMeta();
	const planFromUpsells = usePlanFromUpsells();
	const [ forceDefaultPlans, setForceDefaultPlans ] = useState( false );

	const [ intent, setIntent ] = useState< PlansIntent | undefined >( undefined );
	useEffect( () => {
		if ( intentFromSiteMeta.processing ) {
			return;
		}

		// TODO: plans from upsell takes precedence for setting intent right now
		// - this is currently set to the default wpcom set until we have updated tailored features for all plans
		// - at which point, we'll inject the upsell plan to the tailored plans mix instead
		if ( 'plans-default-wpcom' !== intent && forceDefaultPlans ) {
			setIntent( 'plans-default-wpcom' );
		} else if ( ! intent ) {
			setIntent(
				planFromUpsells
					? 'plans-default-wpcom'
					: intentFromProps || intentFromSiteMeta.intent || 'plans-default-wpcom'
			);
		}
	}, [
		intent,
		intentFromProps,
		intentFromSiteMeta.intent,
		planFromUpsells,
		forceDefaultPlans,
		intentFromSiteMeta.processing,
	] );

	const showEscapeHatch =
		intentFromSiteMeta.intent && ! isInSignup && 'plans-default-wpcom' !== intent;

	const {
		isLoading: isTrailMapExperimentLoading,
		isTrailMapAny,
		isTrailMapCopy,
		isTrailMapStructure,
	} = useExperimentForTrailMap( {
		flowName,
		isInSignup,
		intent,
	} );

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
		withDiscount,
	} );

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
		intent,
		isDisplayingPlansNeededForFeature,
		isSubdomainNotGenerated: ! resolvedSubdomainName.result,
		selectedFeature,
		selectedPlan,
		showLegacyStorageFeature,
		siteId,
		storageAddOns,
		term,
		useCheckPlanAvailabilityForPurchase,
		useFreeTrialPlanSlugs,
		forceDefaultPlans: shouldForceDefaultPlansBasedOnIntent( intent ),
	} );

	let highlightLabelOverrides: { [ K in PlanSlug ]?: TranslateResult } | undefined;
	if ( isTrailMapAny ) {
		highlightLabelOverrides = {
			[ PLAN_ECOMMERCE ]: translate( 'Best for eCommerce' ),
		};
	}

	// we need only the visible ones for features grid (these should extend into plans-ui data store selectors)
	const gridPlansForFeaturesGridRaw = useGridPlansForFeaturesGrid( {
		allFeaturesList: getFeaturesList(),
		coupon,
		eligibleForFreeHostingTrial,
		hasRedeemedDomainCredit: currentPlan?.hasRedeemedDomainCredit,
		hiddenPlans,
		intent,
		isDisplayingPlansNeededForFeature,
		isInSignup,
		isSubdomainNotGenerated: ! resolvedSubdomainName.result,
		selectedFeature,
		selectedPlan,
		showLegacyStorageFeature,
		siteId,
		storageAddOns,
		term,
		useCheckPlanAvailabilityForPurchase,
		useFreeTrialPlanSlugs,
		highlightLabelOverrides,
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

	// In some cases, the free plan is not an option at all. Make sure not to offer it in the subheader.
	const offeringFreePlan = gridPlansForFeaturesGridRaw?.some(
		( { planSlug } ) => planSlug === PLAN_FREE
	);

	let hidePlanSelector = false;
	// In the "purchase a plan and free domain" flow we do not want to show
	// monthly plans because monthly plans do not come with a free domain.
	if ( redirectToAddDomainFlow !== undefined || hidePlanTypeSelector ) {
		hidePlanSelector = true;
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

	const filteredDisplayedIntervals = useFilteredDisplayedIntervals( {
		productSlug: currentPlan?.productSlug,
		displayedIntervals,
		intent,
		paidDomainName,
	} );

	const planTypeSelectorProps = useMemo( () => {
		const props = {
			basePlansPath,
			isStepperUpgradeFlow,
			isInSignup,
			eligibleForWpcomMonthlyPlans,
			intervalType,
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
			withDiscount,
			intent,
		};

		const handlePlanIntervalUpdate = ( interval: SupportedUrlFriendlyTermType ) => {
			let isDomainUpsellFlow: string | null = '';
			let isDomainAndPlanPackageFlow: string | null = '';
			let isJetpackAppFlow: string | null = '';

			if ( typeof window !== 'undefined' ) {
				isDomainUpsellFlow = new URLSearchParams( window.location.search ).get( 'domain' );
				isDomainAndPlanPackageFlow = new URLSearchParams( window.location.search ).get(
					'domainAndPlanPackage'
				);
				isJetpackAppFlow = new URLSearchParams( window.location.search ).get( 'jetpackAppPlans' );
			}

			const pathOrQueryParam = getPlanTypeDestination( props, {
				intervalType: interval,
				domain: isDomainUpsellFlow,
				domainAndPlanPackage: isDomainAndPlanPackageFlow,
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
		intervalType,
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
		withDiscount,
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
	 * Calculates the height of the masterbar if it exists, and passes it to the component as an offset
	 * for the sticky CTA bar.
	 */
	useLayoutEffect( () => {
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
		( addOnSlug: WPComStorageAddOnSlug ) =>
			recordTracksEvent( 'calypso_signup_storage_add_on_dropdown_option_click', {
				add_on_slug: addOnSlug,
			} ),
		[]
	);

	const comparisonGridContainerClasses = clsx( 'plans-features-main__comparison-grid-container', {
		'is-hidden': ! showPlansComparisonGrid,
	} );
	const [ isExperimentLoading ] = useExperiment(
		'calypso_signup_onboarding_plans_paid_domain_free_plan_modal_optimization'
	);
	const isLoadingGridPlans = Boolean(
		! intent ||
			! gridPlansForFeaturesGrid ||
			! gridPlansForComparisonGrid ||
			isExperimentLoading ||
			isTrailMapExperimentLoading
	);
	const isPlansGridReady = ! isLoadingGridPlans && ! resolvedSubdomainName.isLoading;

	const isMobile = useMobileBreakpoint();
	const enablePlanTypeSelectorStickyBehavior = isMobile && showPlanTypeSelectorDropdown;
	const stickyPlanTypeSelectorHeight = isMobile ? 62 : 48;
	const comparisonGridStickyRowOffset = enablePlanTypeSelectorStickyBehavior
		? stickyPlanTypeSelectorHeight + masterbarHeight
		: masterbarHeight;
	const planUpgradeCreditsApplicable = usePlanUpgradeCreditsApplicable(
		siteId,
		gridPlansForFeaturesGrid?.map( ( gridPlan ) => gridPlan.planSlug )
	);

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

	// If we have a Woo Express plan, use the Woo Express feature groups, otherwise use the regular feature groups.
	const featureGroupMapForComparisonGrid = hasWooExpressFeatures
		? getWooExpressFeaturesGroupedForComparisonGrid()
		: getPlanFeaturesGroupedForComparisonGrid();

	const featureGroupMapForFeaturesGrid = hasWooExpressFeatures
		? getWooExpressFeaturesGroupedForFeaturesGrid()
		: getPlanFeaturesGroupedForFeaturesGrid();

	return (
		<>
			<div className={ clsx( 'plans-features-main', 'is-pricing-grid-2023-plans-features-main' ) }>
				<QueryPlans coupon={ coupon } />
				<QuerySites siteId={ siteId } />
				<QuerySitePlans siteId={ siteId } />
				<QueryActivePromotions />
				<QueryProductsList />
				<PlanUpsellModal
					isModalOpen={ isModalOpen }
					paidDomainName={ paidDomainName }
					modalType={ resolveModal( lastClickedPlan ) }
					generatedWPComSubdomain={ resolvedSubdomainName }
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
						showLegacyStorageFeature={ showLegacyStorageFeature }
						{ ...( withDiscount &&
							discountEndDate && {
								discountInformation: {
									withDiscount,
									discountEndDate,
								},
							} ) }
					/>
				) }
				<PlansPageSubheader
					siteSlug={ siteSlug }
					isDisplayingPlansNeededForFeature={ isDisplayingPlansNeededForFeature }
					offeringFreePlan={ offeringFreePlan }
					deemphasizeFreePlan={ deemphasizeFreePlan }
					onFreePlanCTAClick={ onFreePlanCTAClick }
					showPlanBenefits={ isInSignup && isTrailMapAny }
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
							} ) }
							data-e2e-plans="wpcom"
						>
							<div className="plans-wrapper">
								{ gridPlansForFeaturesGrid && (
									<FeaturesGrid
										allFeaturesList={ getFeaturesList() }
										className="plans-features-main__features-grid"
										coupon={ coupon }
										currentSitePlanSlug={ sitePlanSlug }
										generatedWPComSubdomain={ resolvedSubdomainName }
										gridPlanForSpotlight={ gridPlanForSpotlight }
										gridPlans={ gridPlansForFeaturesGrid }
										hideUnavailableFeatures={ hideUnavailableFeatures }
										intent={ intent }
										intervalType={ intervalType }
										isCustomDomainAllowedOnFreePlan={ isCustomDomainAllowedOnFreePlan }
										isInAdmin={ ! isInSignup }
										isInSignup={ isInSignup }
										onStorageAddOnClick={ handleStorageAddOnClick }
										paidDomainName={ isTrailMapCopy ? undefined : paidDomainName }
										planUpgradeCreditsApplicable={ planUpgradeCreditsApplicable }
										recordTracksEvent={ recordTracksEvent }
										selectedFeature={ selectedFeature }
										showLegacyStorageFeature={ showLegacyStorageFeature }
										showRefundPeriod={ isAnyHostingFlow( flowName ) }
										showUpgradeableStorage={ showUpgradeableStorage }
										siteId={ siteId }
										stickyRowOffset={ masterbarHeight }
										useCheckPlanAvailabilityForPurchase={ useCheckPlanAvailabilityForPurchase }
										useAction={ useAction }
										enableFeatureTooltips={ ! isTrailMapCopy }
										enableCategorisedFeatures={ isTrailMapStructure }
										featureGroupMap={ featureGroupMapForFeaturesGrid }
									/>
								) }
								{ showEscapeHatch && hidePlansFeatureComparison && (
									<div className="plans-features-main__escape-hatch">
										<Button borderless onClick={ () => setForceDefaultPlans( true ) }>
											{ translate( 'View all plans' ) }
										</Button>
									</div>
								) }
								{ ! hidePlansFeatureComparison && (
									<>
										<ComparisonGridToggle
											onClick={ toggleShowPlansComparisonGrid }
											label={
												showPlansComparisonGrid
													? translate( 'Hide comparison' )
													: translate( 'Compare plans' )
											}
										/>
										{ showEscapeHatch && (
											<div className="plans-features-main__escape-hatch">
												<Button borderless onClick={ () => setForceDefaultPlans( true ) }>
													{ translate( 'View all plans' ) }
												</Button>
											</div>
										) }
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
													intervalType={ intervalType }
													isInAdmin={ ! isInSignup }
													isInSignup={ isInSignup }
													onStorageAddOnClick={ handleStorageAddOnClick }
													planTypeSelectorProps={
														! hidePlanSelector
															? { ...planTypeSelectorProps, plans: gridPlansForPlanTypeSelector }
															: undefined
													}
													planUpgradeCreditsApplicable={ planUpgradeCreditsApplicable }
													recordTracksEvent={ recordTracksEvent }
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
													enableFeatureTooltips={ ! isTrailMapCopy }
													featureGroupMap={ featureGroupMapForComparisonGrid }
													hideUnsupportedFeatures={ isTrailMapStructure }
												/>
											) }
											<ComparisonGridToggle
												onClick={ toggleShowPlansComparisonGrid }
												label={ translate( 'Hide comparison' ) }
											/>
											{ showEscapeHatch && (
												<div className="plans-features-main__escape-hatch">
													<Button borderless onClick={ () => setForceDefaultPlans( true ) }>
														{ translate( 'View all plans' ) }
													</Button>
												</div>
											) }
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
