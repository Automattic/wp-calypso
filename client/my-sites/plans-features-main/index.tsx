import config from '@automattic/calypso-config';
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
import styled from '@emotion/styled';
import { useDispatch } from '@wordpress/data';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from '@wordpress/element';
import classNames from 'classnames';
import { localize, useTranslate } from 'i18n-calypso';
import page from 'page';
import { useSelector } from 'react-redux';
import QueryPlans from 'calypso/components/data/query-plans';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySites from 'calypso/components/data/query-sites';
import FormattedHeader from 'calypso/components/formatted-header';
import { retargetViewPlans } from 'calypso/lib/analytics/ad-tracking';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { planItem as getCartItemForPlan } from 'calypso/lib/cart-values/cart-items';
import { isValidFeatureKey, FEATURES_LIST } from 'calypso/lib/plans/features-list';
import scrollIntoViewport from 'calypso/lib/scroll-into-viewport';
import PlanFeatures2023Grid from 'calypso/my-sites/plan-features-2023-grid';
import useGridPlans from 'calypso/my-sites/plan-features-2023-grid/hooks/npm-ready/data-store/use-grid-plans';
import usePlanFeaturesForGridPlans from 'calypso/my-sites/plan-features-2023-grid/hooks/npm-ready/data-store/use-plan-features-for-grid-plans';
import useRestructuredPlanFeaturesForComparisonGrid from 'calypso/my-sites/plan-features-2023-grid/hooks/npm-ready/data-store/use-restructured-plan-features-for-comparison-grid';
import PlanNotice from 'calypso/my-sites/plans-features-main/components/plan-notice';
import PlanTypeSelector from 'calypso/my-sites/plans-features-main/components/plan-type-selector';
import { useOdieAssistantContext } from 'calypso/odie/context';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import canUpgradeToPlan from 'calypso/state/selectors/can-upgrade-to-plan';
import getDomainFromHomeUpsellInQuery from 'calypso/state/selectors/get-domain-from-home-upsell-in-query';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import isEligibleForWpComMonthlyPlan from 'calypso/state/selectors/is-eligible-for-wpcom-monthly-plan';
import { useSiteGlobalStylesStatus } from 'calypso/state/sites/hooks/use-site-global-styles-status';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSitePlanSlug, getSiteSlug } from 'calypso/state/sites/selectors';
import { FreePlanFreeDomainDialog } from './components/free-plan-free-domain-dialog';
import { FreePlanPaidDomainDialog } from './components/free-plan-paid-domain-dialog';
import usePricedAPIPlans from './hooks/data-store/use-priced-api-plans';
import usePricingMetaForGridPlans from './hooks/data-store/use-pricing-meta-for-grid-plans';
import useFilterPlansForPlanFeatures from './hooks/use-filter-plans-for-plan-features';
import useIsCustomDomainAllowedOnFreePlan from './hooks/use-is-custom-domain-allowed-on-free-plan';
import useIsPlanUpsellEnabledOnFreeDomain from './hooks/use-is-plan-upsell-enabled-on-free-domain';
import usePlanBillingPeriod from './hooks/use-plan-billing-period';
import usePlanFromUpsells from './hooks/use-plan-from-upsells';
import usePlanIntentFromSiteMeta from './hooks/use-plan-intent-from-site-meta';
import usePlanUpgradeabilityCheck from './hooks/use-plan-upgradeability-check';
import useGetFreeSubdomainSuggestion from './hooks/use-suggested-free-domain-from-paid-domain';
import type { IntervalType } from './types';
import type { DomainSuggestion } from '@automattic/data-stores';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import type {
	GridPlan,
	PlansIntent,
} from 'calypso/my-sites/plan-features-2023-grid/hooks/npm-ready/data-store/use-grid-plans';
import type {
	DataResponse,
	PlanActionOverrides,
} from 'calypso/my-sites/plan-features-2023-grid/types';
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
	isReskinned?: boolean;
	isPlansInsideStepper?: boolean;
	showBiennialToggle?: boolean;
	hideUnavailableFeatures?: boolean; // used to hide features that are not available, instead of strike-through as explained in #76206
	showLegacyStorageFeature?: boolean;
	isSpotlightOnCurrentPlan?: boolean;
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
	const [ isFreePlanFreeDomainDialogOpen, setIsFreePlanFreeDomainDialogOpen ] = useState( false );
	const [ showPlansComparisonGrid, setShowPlansComparisonGrid ] = useState( false );
	const [ masterbarHeight, setMasterbarHeight ] = useState( 0 );
	const translate = useTranslate();
	const plansComparisonGridRef = useRef< HTMLDivElement >( null );
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
	const isPlanUpsellEnabledOnFreeDomain = useIsPlanUpsellEnabledOnFreeDomain(
		flowName,
		!! paidDomainName
	);
	const { globalStylesInPersonalPlan } = useSiteGlobalStylesStatus( siteId );
	const { setShowDomainUpsellDialog } = useDispatch( WpcomPlansUI.store );
	const domainFromHomeUpsellFlow = useSelector( getDomainFromHomeUpsellInQuery );
	const showUpgradeableStorage = config.isEnabled( 'plans/upgradeable-storage' );

	const toggleShowPlansComparisonGrid = () => {
		setShowPlansComparisonGrid( ! showPlansComparisonGrid );
	};

	const showDomainUpsellDialog = useCallback( () => {
		setShowDomainUpsellDialog( true );
	}, [ setShowDomainUpsellDialog ] );

	const { isVisible, setIsVisible, trackEvent } = useOdieAssistantContext();

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
			recordTracksEvent( 'calypso_signup_free_plan_click' );

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
				setIsFreePlanFreeDomainDialogOpen( true );
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

	// TODO: plans from upsell takes precedence for setting intent right now
	// - this is currently set to the default wpcom set until we have updated tailored features for all plans
	// - at which point, we'll inject the upsell plan to the tailored plans mix instead
	const intentFromSiteMeta = usePlanIntentFromSiteMeta();
	const planFromUpsells = usePlanFromUpsells();
	const intent = planFromUpsells
		? 'plans-default-wpcom'
		: intentFromProps || intentFromSiteMeta.intent || 'plans-default-wpcom';

	const gridPlans = useGridPlans( {
		allFeaturesList: FEATURES_LIST,
		usePricedAPIPlans,
		usePricingMetaForGridPlans,
		selectedFeature,
		term,
		intent,
		selectedPlan,
		sitePlanSlug,
		hideEnterprisePlan,
		usePlanUpgradeabilityCheck,
		showLegacyStorageFeature,
		isGlobalStylesOnPersonal: globalStylesInPersonalPlan,
	} );

	const planFeaturesForFeaturesGrid = usePlanFeaturesForGridPlans( {
		planSlugs: gridPlans.map( ( gridPlan ) => gridPlan.planSlug ),
		allFeaturesList: FEATURES_LIST,
		intent,
		isGlobalStylesOnPersonal: globalStylesInPersonalPlan,
		selectedFeature,
		showLegacyStorageFeature,
	} );

	const planFeaturesForComparisonGrid = useRestructuredPlanFeaturesForComparisonGrid( {
		planSlugs: gridPlans.map( ( gridPlan ) => gridPlan.planSlug ),
		allFeaturesList: FEATURES_LIST,
		intent,
		isGlobalStylesOnPersonal: globalStylesInPersonalPlan,
		selectedFeature,
		showLegacyStorageFeature,
	} );

	// TODO: `useFilterPlansForPlanFeatures` should gradually deprecate and whatever remains to fall into the `useGridPlans` hook
	const filteredPlansForPlanFeatures = useFilterPlansForPlanFeatures( {
		plans: gridPlans,
		isDisplayingPlansNeededForFeature: isDisplayingPlansNeededForFeature(),
		selectedPlan,
		hideFreePlan,
		hidePersonalPlan,
		hidePremiumPlan,
		hideBusinessPlan,
		hideEcommercePlan,
	} );

	// we neeed only the visible ones for comparison grid (these should extend into plans-ui data store selectors)
	const gridPlansForComparisonGrid = filteredPlansForPlanFeatures.reduce( ( acc, gridPlan ) => {
		if ( gridPlan.isVisible ) {
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

	// we neeed only the visible ones for features grid (these should extend into plans-ui data store selectors)
	const gridPlansForFeaturesGrid = filteredPlansForPlanFeatures.reduce( ( acc, gridPlan ) => {
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

	let _customerType = chooseDefaultCustomerType( {
		currentCustomerType: customerType,
		selectedPlan,
		currentPlan: { productSlug: currentPlan?.productSlug },
	} );
	// Make sure the plans for the default customer type can be purchased.
	if ( _customerType === 'personal' && userCanUpgradeToPersonalPlan ) {
		_customerType = 'business';
	}

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
		plans: gridPlansForFeaturesGrid.map( ( gridPlan ) => gridPlan.planSlug ),
	};

	const planActionOverrides: PlanActionOverrides | undefined =
		sitePlanSlug && isFreePlan( sitePlanSlug )
			? {
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
			  }
			: undefined;

	/**
	 * The spotlight in smaller grids looks broken.
	 * So for now we only allow the spotlight in the default grid plans grid where we display all 6 plans.
	 * In order to accommodate this for other variations with lesser number of plans the design needs to be reworked.
	 * Or else the intent needs to be explicitly allow the spotlight to be shown in this relevant intent.
	 * Eventually once the spotlight card is made responsive this flag can be removed.
	 * Check : https://github.com/Automattic/wp-calypso/pull/80232 for more details.
	 */
	const gridPlanForSpotlight =
		sitePlanSlug && isSpotlightOnCurrentPlan && SPOTLIGHT_ENABLED_INTENTS.includes( intent )
			? gridPlansForFeaturesGrid.find(
					( { planSlug } ) => getPlanClass( planSlug ) === getPlanClass( sitePlanSlug )
			  )
			: undefined;

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
			{ isFreePlanFreeDomainDialogOpen && (
				<FreePlanFreeDomainDialog
					suggestedPlanSlug={ PLAN_PERSONAL }
					freeSubdomain={ resolvedSubdomainName }
					onClose={ () => setIsFreePlanFreeDomainDialogOpen( false ) }
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
			{ isDisplayingPlansNeededForFeature() && <SecondaryFormattedHeader siteSlug={ siteSlug } /> }
			{ ! intentFromSiteMeta.processing && (
				<>
					{ ! hidePlanSelector && <PlanTypeSelector { ...planTypeSelectorProps } /> }
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
						<PlanFeatures2023Grid
							gridPlansForFeaturesGrid={ gridPlansForFeaturesGrid }
							gridPlansForComparisonGrid={ gridPlansForComparisonGrid }
							gridPlanForSpotlight={ gridPlanForSpotlight }
							paidDomainName={ paidDomainName }
							wpcomFreeDomainSuggestion={ wpcomFreeDomainSuggestion }
							isCustomDomainAllowedOnFreePlan={ isCustomDomainAllowedOnFreePlan }
							isInSignup={ isInSignup }
							isLaunchPage={ isLaunchPage }
							onUpgradeClick={ handleUpgradeClick }
							flowName={ flowName }
							selectedFeature={ selectedFeature }
							selectedPlan={ selectedPlan }
							siteId={ siteId }
							isReskinned={ isReskinned }
							intervalType={ intervalType }
							hidePlansFeatureComparison={ hidePlansFeatureComparison }
							hideUnavailableFeatures={ hideUnavailableFeatures }
							currentSitePlanSlug={ sitePlanSlug }
							planActionOverrides={ planActionOverrides }
							intent={ intent }
							isGlobalStylesOnPersonal={ globalStylesInPersonalPlan }
							showLegacyStorageFeature={ showLegacyStorageFeature }
							showUpgradeableStorage={ showUpgradeableStorage }
							stickyRowOffset={ masterbarHeight }
							usePricingMetaForGridPlans={ usePricingMetaForGridPlans }
							allFeaturesList={ FEATURES_LIST }
							showOdie={ () => {
								if ( ! isVisible ) {
									trackEvent( 'calypso_odie_chat_toggle_visibility', {
										visibility: true,
										trigger: 'scroll',
									} );
									setIsVisible( true );
								}
							} }
							showPlansComparisonGrid={ showPlansComparisonGrid }
							toggleShowPlansComparisonGrid={ toggleShowPlansComparisonGrid }
							planTypeSelectorProps={ planTypeSelectorProps }
							ref={ plansComparisonGridRef }
						/>
					</div>
				</>
			) }
		</div>
	);
};

export default localize( PlansFeaturesMain );
