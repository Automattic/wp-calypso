import config from '@automattic/calypso-config';
import {
	chooseDefaultCustomerType,
	getPlan,
	getPlanClass,
	getPlanPath,
	isFreePlan,
	isPersonalPlan,
	PLAN_PERSONAL,
	PRODUCT_1GB_SPACE,
	WPComStorageAddOnSlug,
	PLAN_HOSTING_TRIAL_MONTHLY,
	PLAN_ENTERPRISE_GRID_WPCOM,
	PLAN_FREE,
	isWpcomEnterpriseGridPlan,
	type PlanSlug,
	UrlFriendlyTermType,
	getBillingMonthsForTerm,
	URL_FRIENDLY_TERMS_MAPPING,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button, Spinner } from '@automattic/components';
import { WpcomPlansUI } from '@automattic/data-stores';
import { isAnyHostingFlow } from '@automattic/onboarding';
import { isMobile } from '@automattic/viewport';
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
import classNames from 'classnames';
import { localize, useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import QueryActivePromotions from 'calypso/components/data/query-active-promotions';
import QueryPlans from 'calypso/components/data/query-plans';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySites from 'calypso/components/data/query-sites';
import FormattedHeader from 'calypso/components/formatted-header';
import { retargetViewPlans } from 'calypso/lib/analytics/ad-tracking';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	planItem as getCartItemForPlan,
	getPlanCartItem,
} from 'calypso/lib/cart-values/cart-items';
import { isValidFeatureKey, FEATURES_LIST } from 'calypso/lib/plans/features-list';
import scrollIntoViewport from 'calypso/lib/scroll-into-viewport';
import { addQueryArgs } from 'calypso/lib/url';
import useStorageAddOns from 'calypso/my-sites/add-ons/hooks/use-storage-add-ons';
import PlanNotice from 'calypso/my-sites/plans-features-main/components/plan-notice';
import usePlanTypeDestinationCallback from 'calypso/my-sites/plans-features-main/hooks/use-plan-type-destination-callback';
import { FeaturesGrid, ComparisonGrid, PlanTypeSelector } from 'calypso/my-sites/plans-grid';
import { SupportedUrlFriendlyTermType } from 'calypso/my-sites/plans-grid/components/plan-type-selector/types';
import useGridPlans from 'calypso/my-sites/plans-grid/hooks/npm-ready/data-store/use-grid-plans';
import usePlanFeaturesForGridPlans from 'calypso/my-sites/plans-grid/hooks/npm-ready/data-store/use-plan-features-for-grid-plans';
import useRestructuredPlanFeaturesForComparisonGrid from 'calypso/my-sites/plans-grid/hooks/npm-ready/data-store/use-restructured-plan-features-for-comparison-grid';
import { useFreeTrialPlanSlugs } from 'calypso/my-sites/plans-grid/hooks/npm-ready/use-free-trial-plan-slugs';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import canUpgradeToPlan from 'calypso/state/selectors/can-upgrade-to-plan';
import getDomainFromHomeUpsellInQuery from 'calypso/state/selectors/get-domain-from-home-upsell-in-query';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import isEligibleForWpComMonthlyPlan from 'calypso/state/selectors/is-eligible-for-wpcom-monthly-plan';
import { isUserEligibleForFreeHostingTrial } from 'calypso/state/selectors/is-user-eligible-for-free-hosting-trial';
import { getCurrentPlan, isCurrentUserCurrentPlanOwner } from 'calypso/state/sites/plans/selectors';
import { getSitePlanSlug, getSiteSlug, isCurrentPlanPaid } from 'calypso/state/sites/selectors';
import ComparisonGridToggle from './components/comparison-grid-toggle';
import PlanUpsellModal from './components/plan-upsell-modal';
import { useModalResolutionCallback } from './components/plan-upsell-modal/hooks/use-modal-resolution-callback';
import useCheckPlanAvailabilityForPurchase from './hooks/use-check-plan-availability-for-purchase';
import useCurrentPlanManageHref from './hooks/use-current-plan-manage-href';
import useFilterPlansForPlanFeatures from './hooks/use-filter-plans-for-plan-features';
import useObservableForOdie from './hooks/use-observable-for-odie';
import usePlanBillingPeriod from './hooks/use-plan-billing-period';
import usePlanFromUpsells from './hooks/use-plan-from-upsells';
import usePlanIntentFromSiteMeta from './hooks/use-plan-intent-from-site-meta';
import { usePlanUpgradeCreditsApplicable } from './hooks/use-plan-upgrade-credits-applicable';
import useGetFreeSubdomainSuggestion from './hooks/use-suggested-free-domain-from-paid-domain';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import type {
	GridPlan,
	PlansIntent,
} from 'calypso/my-sites/plans-grid/hooks/npm-ready/data-store/use-grid-plans';
import type { DataResponse, PlanActionOverrides } from 'calypso/my-sites/plans-grid/types';
import type { IAppState } from 'calypso/state/types';

import './style.scss';

const SPOTLIGHT_ENABLED_INTENTS = [ 'plans-default-wpcom' ];

const FreePlanSubHeader = styled.p`
	margin: -32px 0 40px 0;
	color: var( --studio-gray-60 );
	font-size: 1rem;
	text-align: center;
	button.is-borderless {
		font-weight: 500;
		color: var( --studio-gray-90 );
		text-decoration: underline;
		font-size: 16px;
		padding: 0;
	}
	@media ( max-width: 960px ) {
		margin-top: -16px;
	}
`;

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
	isPlansInsideStepper?: boolean;
	hideUnavailableFeatures?: boolean; // used to hide features that are not available, instead of strike-through as explained in #76206
	showLegacyStorageFeature?: boolean;
	isSpotlightOnCurrentPlan?: boolean;
	renderSiblingWhenLoaded?: () => ReactNode; // renders additional components as last dom node when plans grid dependecies are fully loaded
	/**
	 * Shows the plan type selector dropdown instead of the default toggle
	 */
	showPlanTypeSelectorDropdown?: boolean;
	onPlanIntervalChange?: ( path: string ) => void;
}

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
	isPlansInsideStepper = false,
	isStepperUpgradeFlow = false,
	isLaunchPage = false,
	showLegacyStorageFeature = false,
	isSpotlightOnCurrentPlan,
	renderSiblingWhenLoaded,
	showPlanTypeSelectorDropdown = false,
	coupon,
	onPlanIntervalChange,
}: PlansFeaturesMainProps ) => {
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const [ lastClickedPlan, setLastClickedPlan ] = useState< string | null >( null );
	const [ showPlansComparisonGrid, setShowPlansComparisonGrid ] = useState( false );
	const translate = useTranslate();
	const storageAddOns = useStorageAddOns( { siteId, isInSignup } );
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
	const { setShowDomainUpsellDialog } = useDispatch( WpcomPlansUI.store );
	const domainFromHomeUpsellFlow = useSelector( getDomainFromHomeUpsellInQuery );
	const showUpgradeableStorage = config.isEnabled( 'plans/upgradeable-storage' );
	const observableForOdieRef = useObservableForOdie();
	const currentPlanManageHref = useCurrentPlanManageHref();
	const canUserManageCurrentPlan = useSelector( ( state: IAppState ) =>
		siteId
			? ! isCurrentPlanPaid( state, siteId ) || isCurrentUserCurrentPlanOwner( state, siteId )
			: null
	);
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

	const handleUpgradeClick = useCallback(
		( cartItems?: MinimalRequestCartProduct[] | null, clickedPlanSlug?: PlanSlug ) => {
			if ( isWpcomEnterpriseGridPlan( clickedPlanSlug ?? '' ) ) {
				recordTracksEvent( 'calypso_plan_step_enterprise_click', { flow: flowName } );
				window.open( 'https://wpvip.com/wordpress-vip-agile-content-platform', '_blank' );
				return;
			}
			const cartItemForPlan = getPlanCartItem( cartItems );
			const planSlug = clickedPlanSlug ?? PLAN_FREE;
			setLastClickedPlan( planSlug );
			if ( isFreePlan( planSlug ) ) {
				recordTracksEvent( 'calypso_signup_free_plan_click' );
			}

			const displayedModal = resolveModal( planSlug );
			if ( displayedModal ) {
				setIsModalOpen( true );
				return;
			}

			const cartItemForStorageAddOn = cartItems?.find(
				( items ) => items.product_slug === PRODUCT_1GB_SPACE
			);

			if ( cartItemForStorageAddOn?.extra ) {
				recordTracksEvent( 'calypso_signup_storage_add_on_upgrade_click', {
					add_on_slug: cartItemForStorageAddOn.extra.feature_slug,
				} );
			}

			if ( onUpgradeClick ) {
				onUpgradeClick( cartItems );
				return;
			}

			const planPath = cartItemForPlan?.product_slug
				? getPlanPath( cartItemForPlan.product_slug )
				: '';

			const checkoutUrl = cartItemForStorageAddOn
				? `/checkout/${ siteSlug }/${ planPath },${ cartItemForStorageAddOn.product_slug }:-q-${ cartItemForStorageAddOn.quantity }`
				: `/checkout/${ siteSlug }/${ planPath }`;

			const checkoutUrlWithArgs = addQueryArgs(
				{ ...( withDiscount && { coupon: withDiscount } ) },
				checkoutUrl
			);

			page( checkoutUrlWithArgs );
		},
		[ flowName, onUpgradeClick, resolveModal, siteSlug, withDiscount ]
	);

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

	const eligibleForFreeHostingTrial = useSelector( isUserEligibleForFreeHostingTrial );

	const gridPlans = useGridPlans( {
		allFeaturesList: FEATURES_LIST,
		useFreeTrialPlanSlugs,
		selectedFeature,
		term,
		intent,
		selectedPlan,
		sitePlanSlug,
		hideEnterprisePlan,
		useCheckPlanAvailabilityForPurchase,
		eligibleForFreeHostingTrial,
		showLegacyStorageFeature,
		isSubdomainNotGenerated: ! resolvedSubdomainName.result,
		storageAddOns,
		coupon,
		selectedSiteId: siteId,
	} );

	const planFeaturesForFeaturesGrid = usePlanFeaturesForGridPlans( {
		gridPlans: gridPlans || [],
		allFeaturesList: FEATURES_LIST,
		intent,
		selectedFeature,
		showLegacyStorageFeature,
		isInSignup,
	} );

	const planFeaturesForComparisonGrid = useRestructuredPlanFeaturesForComparisonGrid( {
		gridPlans: gridPlans || [],
		allFeaturesList: FEATURES_LIST,
		intent,
		selectedFeature,
		showLegacyStorageFeature,
	} );

	// TODO: `useFilterPlansForPlanFeatures` should gradually deprecate and whatever remains to fall into the `useGridPlans` hook
	const filteredPlansForPlanFeatures = useFilterPlansForPlanFeatures( {
		plans: gridPlans || [],
		isDisplayingPlansNeededForFeature: isDisplayingPlansNeededForFeature(),
		selectedPlan,
		hideFreePlan,
		hidePersonalPlan,
		hidePremiumPlan,
		hideBusinessPlan,
		hideEcommercePlan,
	} );

	// we neeed only the visible ones for comparison grid (these should extend into plans-ui data store selectors)
	const gridPlansForComparisonGrid = useMemo( () => {
		const hiddenPlans = [ PLAN_HOSTING_TRIAL_MONTHLY, PLAN_ENTERPRISE_GRID_WPCOM ];

		return filteredPlansForPlanFeatures.reduce( ( acc, gridPlan ) => {
			if ( gridPlan.isVisible && ! hiddenPlans.includes( gridPlan.planSlug ) ) {
				return [
					...acc,
					{
						...gridPlan,
						features: planFeaturesForComparisonGrid[ gridPlan.planSlug ],
					},
				];
			}

			return acc;
		}, [] as GridPlan[] );
	}, [ filteredPlansForPlanFeatures, planFeaturesForComparisonGrid ] );

	// we neeed only the visible ones for features grid (these should extend into plans-ui data store selectors)
	const gridPlansForFeaturesGrid = useMemo( () => {
		return filteredPlansForPlanFeatures.reduce( ( acc, gridPlan ) => {
			if ( gridPlan.isVisible ) {
				return [
					...acc,
					{
						...gridPlan,
						features: planFeaturesForFeaturesGrid[ gridPlan.planSlug ],
					},
				];
			}
			return acc;
		}, [] as GridPlan[] );
	}, [ filteredPlansForPlanFeatures, planFeaturesForFeaturesGrid ] );

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

	let filteredDisplayedIntervals = displayedIntervals;
	// Hide interval terms that are less than the current plan's term in months
	if ( currentPlan?.productSlug && ! isFreePlan( currentPlan.productSlug ) ) {
		const currentPlanIntervalTypeBillingMonths = getBillingMonthsForTerm(
			getPlan( currentPlan.productSlug )?.term || ''
		);
		filteredDisplayedIntervals = displayedIntervals.filter( ( intervalType ) => {
			const intervalTypeInMonths = getBillingMonthsForTerm(
				URL_FRIENDLY_TERMS_MAPPING[ intervalType ] || ''
			);
			return intervalTypeInMonths >= currentPlanIntervalTypeBillingMonths;
		} );
	}

	const planTypeSelectorProps = useMemo( () => {
		const props = {
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
			displayedIntervals: filteredDisplayedIntervals,
			showPlanTypeSelectorDropdown,
			kind: planTypeSelector,
			plans: gridPlansForFeaturesGrid.map( ( gridPlan ) => gridPlan.planSlug ),
			currentSitePlanSlug: sitePlanSlug,
			useCheckPlanAvailabilityForPurchase,
			recordTracksEvent,
			coupon,
			selectedSiteId: siteId,
			withDiscount,
		};

		const handlePlanIntervalChange = ( selectedItem: { key: SupportedUrlFriendlyTermType } ) => {
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
				intervalType: selectedItem.key,
				domain: isDomainUpsellFlow,
				domainAndPlanPackage: isDomainAndPlanPackageFlow,
				jetpackAppPlans: isJetpackAppFlow,
			} );

			if ( onPlanIntervalChange ) {
				return onPlanIntervalChange( pathOrQueryParam );
			}

			if ( hasQueryArg( pathOrQueryParam, 'intervalType' ) ) {
				const currentPath = window.location.pathname;
				return page( currentPath + pathOrQueryParam );
			}

			page( pathOrQueryParam );
		};

		return {
			...props,
			onPlanIntervalChange: handlePlanIntervalChange,
		};
	}, [
		basePlansPath,
		isStepperUpgradeFlow,
		isInSignup,
		eligibleForWpcomMonthlyPlans,
		isPlansInsideStepper,
		intervalType,
		_customerType,
		siteSlug,
		selectedPlan,
		selectedFeature,
		filteredDisplayedIntervals,
		showPlanTypeSelectorDropdown,
		planTypeSelector,
		gridPlansForFeaturesGrid,
		sitePlanSlug,
		coupon,
		siteId,
		withDiscount,
		getPlanTypeDestination,
		onPlanIntervalChange,
	] );

	/**
	 * The effects on /plans page need to be checked if this variable is initialized
	 */
	const planActionOverrides = useMemo( () => {
		let actionOverrides: PlanActionOverrides | undefined;

		if ( isInSignup ) {
			actionOverrides = {
				loggedInFreePlan: {
					status: 'enabled',
				},
			};
		}

		if ( sitePlanSlug && intentFromProps !== 'plans-p2' ) {
			if ( isFreePlan( sitePlanSlug ) ) {
				actionOverrides = {
					loggedInFreePlan: {
						status: 'enabled',
						callback: () => {
							page.redirect( `/add-ons/${ siteSlug }` );
						},
						text: translate( 'Manage add-ons', { context: 'verb' } ),
					},
				};

				if ( domainFromHomeUpsellFlow ) {
					actionOverrides.loggedInFreePlan = {
						...actionOverrides.loggedInFreePlan,
						callback: showDomainUpsellDialog,
						text: translate( 'Keep my plan', { context: 'verb' } ),
					};
				}
			} else {
				actionOverrides = {
					currentPlan: {
						text: canUserManageCurrentPlan ? translate( 'Manage plan' ) : translate( 'View plan' ),
						callback: () => page( currentPlanManageHref ),
					},
				};
			}
		}

		return actionOverrides;
	}, [
		isInSignup,
		sitePlanSlug,
		intentFromProps,
		resolvedSubdomainName.isLoading,
		translate,
		domainFromHomeUpsellFlow,
		siteSlug,
		showDomainUpsellDialog,
		canUserManageCurrentPlan,
		currentPlanManageHref,
	] );

	/**
	 * The spotlight in smaller grids looks broken.
	 * So for now we only allow the spotlight in the default grid plans grid where we display all 6 plans.
	 * In order to accommodate this for other variations with lesser number of plans the design needs to be reworked.
	 * Or else the intent needs to be explicitly allow the spotlight to be shown in this relevant intent.
	 * Eventually once the spotlight card is made responsive this flag can be removed.
	 * Check : https://github.com/Automattic/wp-calypso/pull/80232 for more details.
	 */
	const gridPlanForSpotlight = useMemo( () => {
		return sitePlanSlug &&
			isSpotlightOnCurrentPlan &&
			SPOTLIGHT_ENABLED_INTENTS.includes( intent ?? '' )
			? gridPlansForFeaturesGrid.find(
					( { planSlug } ) => getPlanClass( planSlug ) === getPlanClass( sitePlanSlug )
			  )
			: undefined;
	}, [ sitePlanSlug, isSpotlightOnCurrentPlan, intent, gridPlansForFeaturesGrid ] );

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

		let lastHeight = masterbarElement.offsetHeight;

		const observer = new ResizeObserver(
			( [ masterbar ]: Parameters< ResizeObserverCallback >[ 0 ] ) => {
				const currentHeight = masterbar.contentRect.height;

				if ( currentHeight !== lastHeight ) {
					setMasterbarHeight( currentHeight );
					lastHeight = currentHeight;
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

	const isLoadingGridPlans = Boolean( ! intent || ! gridPlans );

	const handleStorageAddOnClick = useCallback(
		( addOnSlug: WPComStorageAddOnSlug ) =>
			recordTracksEvent( 'calypso_signup_storage_add_on_dropdown_option_click', {
				add_on_slug: addOnSlug,
			} ),
		[]
	);

	const comparisonGridContainerClasses = classNames(
		'plans-features-main__comparison-grid-container',
		{
			'is-hidden': ! showPlansComparisonGrid,
		}
	);

	const isPlansGridReady = ! isLoadingGridPlans && ! resolvedSubdomainName.isLoading;

	const enablePlanTypeSelectorStickyBehavior = isMobile() && showPlanTypeSelectorDropdown;
	const stickyPlanTypeSelectorHeight = isMobile() ? 62 : 48;
	const comparisonGridStickyRowOffset = enablePlanTypeSelectorStickyBehavior
		? stickyPlanTypeSelectorHeight + masterbarHeight
		: masterbarHeight;
	const planUpgradeCreditsApplicable = usePlanUpgradeCreditsApplicable(
		siteId,
		gridPlansForFeaturesGrid.map( ( gridPlan ) => gridPlan.planSlug )
	);

	return (
		<>
			<div
				className={ classNames(
					'plans-features-main',
					'is-pricing-grid-2023-plans-features-main'
				) }
			>
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
				{ siteId && (
					<PlanNotice
						visiblePlans={ gridPlansForFeaturesGrid.map( ( gridPlan ) => gridPlan.planSlug ) }
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
				{ intent === 'plans-paid-media' && (
					<FreePlanSubHeader>
						{ translate(
							`Unlock a powerful bundle of features. Or {{link}}start with a free plan{{/link}}.`,
							{
								components: {
									link: <Button onClick={ () => handleUpgradeClick() } borderless />,
								},
							}
						) }
					</FreePlanSubHeader>
				) }
				{ isDisplayingPlansNeededForFeature() && (
					<SecondaryFormattedHeader siteSlug={ siteSlug } />
				) }
				{ ! isPlansGridReady && <Spinner size={ 30 } /> }
				{ isPlansGridReady && (
					<>
						{ ! hidePlanSelector && (
							<PlanTypeSelector
								{ ...planTypeSelectorProps }
								layoutClassName="plans-features-main__plan-type-selector-layout"
								enableStickyBehavior={ enablePlanTypeSelectorStickyBehavior }
								stickyPlanTypeSelectorOffset={ masterbarHeight - 1 }
								coupon={ coupon }
							/>
						) }
						<div
							className={ classNames(
								'plans-features-main__group',
								'is-wpcom',
								'is-2023-pricing-grid',
								{
									'is-scrollable': plansWithScroll,
								}
							) }
							data-e2e-plans="wpcom"
						>
							<div className="plans-wrapper">
								<FeaturesGrid
									gridPlans={ gridPlansForFeaturesGrid }
									gridPlanForSpotlight={ gridPlanForSpotlight }
									paidDomainName={ paidDomainName }
									generatedWPComSubdomain={ resolvedSubdomainName }
									isCustomDomainAllowedOnFreePlan={ isCustomDomainAllowedOnFreePlan }
									isInSignup={ isInSignup }
									isLaunchPage={ isLaunchPage }
									onUpgradeClick={ handleUpgradeClick }
									selectedFeature={ selectedFeature }
									selectedSiteId={ siteId }
									intervalType={ intervalType }
									hideUnavailableFeatures={ hideUnavailableFeatures }
									currentSitePlanSlug={ sitePlanSlug }
									planActionOverrides={ planActionOverrides }
									intent={ intent }
									showLegacyStorageFeature={ showLegacyStorageFeature }
									showUpgradeableStorage={ showUpgradeableStorage }
									stickyRowOffset={ masterbarHeight }
									useCheckPlanAvailabilityForPurchase={ useCheckPlanAvailabilityForPurchase }
									allFeaturesList={ FEATURES_LIST }
									onStorageAddOnClick={ handleStorageAddOnClick }
									showRefundPeriod={ isAnyHostingFlow( flowName ) }
									recordTracksEvent={ recordTracksEvent }
									coupon={ coupon }
									planUpgradeCreditsApplicable={ planUpgradeCreditsApplicable }
								/>
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
											ref={ observableForOdieRef }
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
											{ ! hidePlanSelector && showPlansComparisonGrid && (
												<PlanTypeSelector
													{ ...planTypeSelectorProps }
													layoutClassName="plans-features-main__plan-type-selector-layout"
													coupon={ coupon }
												/>
											) }
											<ComparisonGrid
												gridPlans={ gridPlansForComparisonGrid }
												isInSignup={ isInSignup }
												isLaunchPage={ isLaunchPage }
												onUpgradeClick={ handleUpgradeClick }
												selectedFeature={ selectedFeature }
												selectedPlan={ selectedPlan }
												selectedSiteId={ siteId }
												intervalType={ intervalType }
												hideUnavailableFeatures={ hideUnavailableFeatures }
												currentSitePlanSlug={ sitePlanSlug }
												planActionOverrides={ planActionOverrides }
												intent={ intent }
												showUpgradeableStorage={ showUpgradeableStorage }
												stickyRowOffset={ comparisonGridStickyRowOffset }
												useCheckPlanAvailabilityForPurchase={ useCheckPlanAvailabilityForPurchase }
												allFeaturesList={ FEATURES_LIST }
												onStorageAddOnClick={ handleStorageAddOnClick }
												showRefundPeriod={ isAnyHostingFlow( flowName ) }
												planTypeSelectorProps={
													! hidePlanSelector ? planTypeSelectorProps : undefined
												}
												coupon={ coupon }
												recordTracksEvent={ recordTracksEvent }
												planUpgradeCreditsApplicable={ planUpgradeCreditsApplicable }
											/>
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
