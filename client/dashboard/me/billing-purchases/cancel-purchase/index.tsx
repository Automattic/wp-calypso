import {
	DomainProductSlugs,
	SubscriptionBillPeriod,
	CancellationOffer,
} from '@automattic/api-core';
import {
	applyCancellationOfferMutation,
	cancelAndRefundPurchaseMutation,
	cancellationOffersQuery,
	userPurchaseSetAutoRenewQuery,
	domainQuery,
	extendPurchaseWithFreeMonthMutation,
	marketingSurveyMutation,
	plansQuery,
	productsQuery,
	purchaseCancelFeaturesQuery,
	purchaseQuery,
	siteByIdQuery,
	siteDomainsQuery,
	sitePurchasesQuery,
	userPreferenceMutation,
	hasPurchaseBeenExtendedQuery,
	siteLatestAtomicTransferQuery,
	siteFeaturesQuery,
	removePurchaseMutation,
	userPreferenceQuery,
	userPurchasesQuery,
} from '@automattic/api-queries';
import { invokeSurvicateEvent } from '@automattic/survicate';
import {
	useSuspenseQuery,
	useQuery,
	useMutation,
	useQueryClient,
	type QueryCacheNotifyEvent,
} from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { _n, sprintf, __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import Breadcrumbs from '../../../app/breadcrumbs';
import { useLocale } from '../../../app/locale';
import { cancelPurchaseRoute, purchaseSettingsRoute, purchasesRoute } from '../../../app/router/me';
import { Card, CardBody } from '../../../components/card';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { shuffleArray } from '../../../utils/collection';
import {
	CANCEL_FLOW_TYPE,
	CancelFlowType,
	getCancelIntentFromSearch,
	getDisplayVariant,
	getIncludedDomainPurchase,
	type CancelIntent,
	type DisplayVariant,
	getMutationFlowType,
	getPurchaseCancellationFlowType,
	hasAmountAvailableToRefund,
	hasMarketplaceProduct,
	isAgencyPartnerType,
	isExpired,
	isGSuiteOrGoogleWorkspaceProductSlug,
	isJetpackHoldingSitePurchase,
	isAkismetProduct,
	isPartnerPurchase,
	isOneTimePurchase,
} from '../../../utils/purchase';
import {
	classifyPurchaseForCopy,
	getProductNounForCategory,
} from '../purchase-settings/classify-purchase-for-copy';
import CancelHeaderTitle from './cancel-header-title';
import CancelPurchaseForm from './cancel-purchase-form';
import {
	cancellationOptionsForPurchase,
	nextAdventureOptionsForPurchase,
} from './cancel-purchase-form/options-for-product';
import {
	ATOMIC_REVERT_STEP,
	CANCEL_CONFIRM_STEP,
	CANCELLATION_OFFER_STEP,
	FEEDBACK_STEP,
	NEXT_ADVENTURE_STEP,
	REMOVE_PLAN_STEP,
	UPSELL_STEP,
} from './cancel-purchase-form/steps';
import CancellationPreSurveyContent from './cancellation-pre-survey-content';
import DomainRemovalFlow from './domain-removal-flow';
import enrichedSurveyData from './enriched-survey-data';
import { getSolutionsForReason } from './get-solutions-for-reason';
import { getUpsellType } from './get-upsell-type';
import initialSurveyState from './initial-survey-state';
import MarketPlaceSubscriptionsDialog from './marketplace-subscriptions-dialog';
import nextStep from './next-step';
import RefundEligibilityNotice from './refund-eligibility-notice';
import TimeRemainingNotice from './time-remaining-notice';
import { useCancelMutationOnConfirm } from './use-cancel-mutation-on-confirm';
import { useIsSplitCancelRemoveEnabled } from './use-is-split-cancel-remove-enabled';
import type { CancelPurchaseState } from './types';
import type {
	Purchase,
	MarketingSurveyDetails,
	PlanProduct,
	UserPreferences,
} from '@automattic/api-core';
import type { ChangeEvent } from 'react';

import './style.scss';

type TopNoticeArgs = {
	surveyShown?: boolean;
	showDomainOptionsStep?: boolean;
	displayVariant: DisplayVariant;
	purchase: Purchase;
	intent: CancelIntent | null;
	isSplitCancelRemoveEnabled: boolean;
};

/**
 * How long the cache-subscription guard stays active after a remove mutation,
 * re-stripping stale server data that still includes the just-deleted purchase.
 */
const CACHE_GUARD_DURATION_MS = 15_000;

function renderTopNotice( args: TopNoticeArgs ) {
	const {
		surveyShown,
		showDomainOptionsStep,
		displayVariant,
		purchase,
		intent,
		isSplitCancelRemoveEnabled,
	} = args;

	if ( surveyShown || showDomainOptionsStep ) {
		return null;
	}

	// Intent-cancel with a refund (flag-on) → promo notice with inline link to
	// switch the user into the remove flow.
	if (
		isSplitCancelRemoveEnabled &&
		displayVariant === 'cancel' &&
		hasAmountAvailableToRefund( purchase )
	) {
		return <RefundEligibilityNotice mode="refund-eligibility" purchase={ purchase } />;
	}

	// Intent-remove with a refund → confirmed refund-amount notice (no CTA).
	if ( displayVariant === 'remove' && hasAmountAvailableToRefund( purchase ) ) {
		return <RefundEligibilityNotice mode="confirmed" purchase={ purchase } />;
	}

	// Everything else → time-remaining notice (itself suppressed on
	// the Remove variant via its own displayVariant check).
	return (
		<TimeRemainingNotice
			purchase={ purchase }
			displayVariant={ displayVariant }
			intent={ intent }
		/>
	);
}

const willShowDomainOptionsRadioButtons = (
	includedDomainPurchase: Purchase,
	purchase: Purchase
) => {
	return (
		includedDomainPurchase.is_domain_registration &&
		purchase.is_refundable &&
		!! includedDomainPurchase.cost_to_unbundle_display &&
		includedDomainPurchase.is_within_initial_refund_window
	);
};

const getDowngradePlanForPurchase = (
	plans: PlanProduct[],
	purchase: Purchase,
	upsell: string | undefined
): PlanProduct | undefined => {
	if ( ! plans ) {
		return;
	}
	const plan = plans.find( ( plan ) => plan.product_id === purchase.product_id );
	if ( ! plan ) {
		return;
	}

	let downgradePlanInfo;
	switch ( upsell ) {
		case 'downgrade-monthly':
			downgradePlanInfo = plan.downgrade_paths.find( ( path ) => {
				return path.bill_period !== plan.bill_period;
			} );
			break;
		case 'downgrade-personal':
			downgradePlanInfo = plan.downgrade_paths.find( ( path ) => {
				return path.bill_period === plan.bill_period;
			} );
			break;
	}
	if ( downgradePlanInfo ) {
		return plans.find( ( plan ) => plan.product_id === downgradePlanInfo.product_id );
	}
};

function getYearlyPlanSlug( plans: PlanProduct[], purchase: Purchase ): string {
	if ( ! plans ) {
		return '';
	}
	// Only for monthly plans
	if ( purchase.bill_period_days !== SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD ) {
		return '';
	}

	const plan = plans.find( ( p ) => p.product_id === purchase.product_id );
	if ( ! plan ) {
		return '';
	}

	// Strategy 1: downgrade_paths — look for annual billing period
	const annualPath = plan.downgrade_paths.find(
		( path ) => path.bill_period === SubscriptionBillPeriod.PLAN_ANNUAL_PERIOD
	);
	if ( annualPath ) {
		return annualPath.product_slug;
	}

	// Strategy 2: product_tier_id match from full plans list
	if ( plan.product_tier_id ) {
		const annualPlan = plans.find(
			( p ) =>
				p.product_tier_id === plan.product_tier_id &&
				p.bill_period === SubscriptionBillPeriod.PLAN_ANNUAL_PERIOD
		);
		if ( annualPlan ) {
			return annualPlan.product_slug;
		}
	}

	return '';
}

function getOfferDiscountBasedOnPurchasePrice(
	purchase: Purchase,
	cancellationOffer: CancellationOffer | undefined
): number {
	if ( ! cancellationOffer ) {
		return 0;
	}
	const offerDiscountPercentage = ( 1 - cancellationOffer.raw_price / purchase.amount ) * 100;
	// Round the cancellation offer discount percentage to the nearest whole number
	return Math.round( offerDiscountPercentage );
}

function availableJetpackSurveySteps( purchase: Purchase, flowType: CancelFlowType ): string[] {
	const availableSteps = [];

	// If the plan is already expired or is a temporary Jetpack purchase (license),
	// we only need one "confirm" step for the survey is the removal confirmation
	// A product that is not in use does not need to collect the survey or show benefits
	if ( isExpired( purchase ) || isJetpackHoldingSitePurchase( purchase ) ) {
		return [ CANCEL_CONFIRM_STEP ];
	}

	// Always include the survey step if it's a normal cancellation flow
	if (
		CANCEL_FLOW_TYPE.CANCEL_AUTORENEW === flowType ||
		CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND === flowType
	) {
		availableSteps.push( FEEDBACK_STEP );
	}

	if ( CANCEL_FLOW_TYPE.REMOVE === flowType ) {
		availableSteps.push( FEEDBACK_STEP );
	}

	return availableSteps;
}

function shouldAddCancellationOfferStep(
	purchase: Purchase,
	flowType: CancelFlowType,
	cancellationOffer: CancellationOffer | undefined
): boolean {
	if ( CANCEL_FLOW_TYPE.REMOVE === flowType ) {
		const isOfferPriceSameOrLowerThanPurchasePrice = cancellationOffer
			? purchase.amount >= cancellationOffer.original_price
			: false;
		const offerDiscountBasedFromPurchasePrice = getOfferDiscountBasedOnPurchasePrice(
			purchase,
			cancellationOffer
		);

		return isOfferPriceSameOrLowerThanPurchasePrice && offerDiscountBasedFromPurchasePrice >= 10;
	}
	return false;
}

function getBasicSurveySteps( {
	purchase,
	upsell,
	hasQuestionTwo,
	plans,
}: {
	purchase: Purchase;
	upsell: CancelPurchaseState[ 'upsell' ];
	hasQuestionTwo: boolean;
	plans: PlanProduct[];
} ): string[] {
	const flowType = getPurchaseCancellationFlowType( purchase );
	const isJetpack = purchase.is_jetpack_plan_or_product;
	const downgradePlan = getDowngradePlanForPurchase( plans, purchase, upsell );
	const isDowngradePlan = [ 'downgrade-monthly', 'downgrade-personal' ].includes( upsell ?? '' );
	const hasExpired = purchase.expiry_status === 'expired';

	if (
		isPartnerPurchase( purchase ) &&
		purchase.partner_type &&
		isAgencyPartnerType( purchase.partner_type )
	) {
		return [];
	}
	if ( isJetpack ) {
		return availableJetpackSurveySteps( purchase, flowType );
	}
	if ( purchase.is_domain_registration ) {
		return [ FEEDBACK_STEP, NEXT_ADVENTURE_STEP ];
	}
	if ( ! isGSuiteOrGoogleWorkspaceProductSlug( purchase.product_slug ) && ! purchase.is_plan ) {
		return [ NEXT_ADVENTURE_STEP ];
	}
	if ( upsell && ! hasExpired && ! isDowngradePlan ) {
		return [ FEEDBACK_STEP, UPSELL_STEP, NEXT_ADVENTURE_STEP ];
	}
	// NOTE: downgradePlan only ever exists if upsell is true (see getDowngradePlanForPurchase).
	if ( upsell && ! hasExpired && downgradePlan ) {
		return [ FEEDBACK_STEP, UPSELL_STEP, NEXT_ADVENTURE_STEP ];
	}
	if ( hasQuestionTwo ) {
		return [ FEEDBACK_STEP, NEXT_ADVENTURE_STEP ];
	}
	return [ FEEDBACK_STEP ];
}

function getAllSurveySteps( {
	purchase,
	upsell,
	cancellationOffer,
	hasQuestionTwo,
	plans,
	userHasCompletedCancelSurveyForPurchase,
	isSplitCancelRemoveEnabled,
}: {
	purchase: Purchase;
	upsell: CancelPurchaseState[ 'upsell' ];
	cancellationOffer: CancellationOffer | undefined;
	hasQuestionTwo: boolean;
	plans: PlanProduct[];
	userHasCompletedCancelSurveyForPurchase: boolean;
	isSplitCancelRemoveEnabled: boolean;
} ): string[] {
	let steps = getBasicSurveySteps( {
		purchase,
		upsell,
		hasQuestionTwo,
		plans,
	} );
	const skipRemovePlanSurvey = purchase.is_plan && userHasCompletedCancelSurveyForPurchase;
	const flowType = getPurchaseCancellationFlowType( purchase );

	if (
		purchase.will_atomic_revert_after_removal &&
		flowType === CANCEL_FLOW_TYPE.REMOVE &&
		! isSplitCancelRemoveEnabled
	) {
		steps.push( ATOMIC_REVERT_STEP );
	}

	// If the survey has already been completed, then remove certain steps and make `REMOVE_PLAN_STEP` the first step.
	if ( skipRemovePlanSurvey ) {
		const stepsToRemove = [ FEEDBACK_STEP, NEXT_ADVENTURE_STEP ];
		steps = steps.filter( ( step ) => ! stepsToRemove.includes( step ) );
		steps = [ REMOVE_PLAN_STEP, ...steps ];
	}

	if ( shouldAddCancellationOfferStep( purchase, flowType, cancellationOffer ) ) {
		steps.push( CANCELLATION_OFFER_STEP );
	}

	return steps;
}

export default function CancelPurchase() {
	// TanStack Router keeps the component mounted across search-param changes,
	// so stale state from a prior cancel-flow run can persist when the user
	// swaps intent (e.g. navigating from Cancel to Remove on Purchase Settings).
	// Keying the inner component on intent lets React remount it, resetting all
	// local state to its initial values.
	const search = useSearch( { from: cancelPurchaseRoute.fullPath } );
	const intent = getCancelIntentFromSearch( search );
	return <CancelPurchaseInner key={ intent ?? 'fallback' } />;
}

function CancelPurchaseInner() {
	const queryClient = useQueryClient();
	const { createSuccessNotice, removeNotice, createErrorNotice } = useDispatch( noticesStore );
	const { recordTracksEvent } = useAnalytics();
	const locale = useLocale();
	const [ state, setState ] = useState< CancelPurchaseState >( {
		questionOneOrder: [],
		initialized: false,
	} );
	const { purchaseId } = cancelPurchaseRoute.useParams();
	const getCancelPurchaseSurveyCompletedPreferenceKey = (
		purchaseId: string | number
	): keyof UserPreferences => {
		return `cancel-purchase-survey-completed-${ purchaseId }`;
	};

	// Queries
	// `useQuery` (not `useSuspenseQuery`) so a post-mutation 404 from the
	// prefix-matched invalidation cascade returns an error result rather than
	// throwing to the error boundary; the snapshot below covers the read.
	// The route loader pre-fetches via `ensureQueryData`, so first paint is
	// instant — `livePurchase` is defined on first render.
	const { data: livePurchase, isPending: purchaseQueryIsPending } = useQuery(
		purchaseQuery( parseInt( purchaseId, 10 ) )
	);

	// Mutations consumed by useCancelMutationOnConfirm
	const setPurchaseAutoRenewMutation = useMutation( userPurchaseSetAutoRenewQuery() );
	const cancelAndRefundMutation = useMutation( cancelAndRefundPurchaseMutation() );
	const removePurchaseMutator = useMutation( removePurchaseMutation() );

	const {
		isPending: isMutationPending,
		fireMutationOnConfirm,
		snapshotPurchase,
	} = useCancelMutationOnConfirm( {
		purchase: livePurchase as Purchase,
		cancelAndRefundMutation,
		setPurchaseAutoRenewMutation,
	} );

	// Pre-confirm: livePurchase from the cache (loader pre-fetched).
	// Post-confirm: the hook captured snapshotPurchase synchronously at
	// fire-time, so reads of `purchase` continue to work even if the
	// mutation's invalidation tears down livePurchase.
	const purchase = ( snapshotPurchase ?? livePurchase ) as Purchase;

	const { data: sitePurchases } = useSuspenseQuery( sitePurchasesQuery( purchase.blog_id ) );
	const { data: siteFeatures, isPending: siteFeaturesQueryIsPending } = useSuspenseQuery(
		siteFeaturesQuery( purchase.blog_id )
	);
	const { data: plans } = useSuspenseQuery( plansQuery() );
	const isSplitCancelRemoveEnabled = useIsSplitCancelRemoveEnabled();
	const { data: purchaseCancelFeatures } = useQuery(
		purchaseCancelFeaturesQuery(
			parseInt( purchaseId, 10 ),
			isSplitCancelRemoveEnabled ? 'treatment' : 'control'
		)
	);

	const lastSiteQueryIsError = useRef< boolean >( false );
	const { data: hasBeenExtended } = useQuery( hasPurchaseBeenExtendedQuery( purchase.blog_id ) );
	const {
		data: site,
		isPending: siteQueryIsPending,
		isError: siteQueryIsError,
	} = useQuery( {
		...siteByIdQuery( purchase.blog_id ),
		enabled: ! lastSiteQueryIsError.current,
	} );
	if ( siteQueryIsError ) {
		lastSiteQueryIsError.current = siteQueryIsError;
	}
	const { data: atomicTransfer, isPending: siteLatestAtomicTransferQueryIsPending } = useQuery(
		siteLatestAtomicTransferQuery( purchase.blog_id )
	);
	const { data: productsList, isPending: productsQueryIsPending } = useQuery( productsQuery() );
	const { data: selectedDomain, isPending: domainQueryIsPending } = useQuery( {
		...domainQuery( purchase.meta ?? '' ),
		enabled: Boolean( purchase.meta ),
	} );
	// site.options.unmapped_url is incorrect for .home.blog sites — read the
	// actual WPCOM domain from the site's domain list instead.
	const { data: siteDomains } = useQuery( siteDomainsQuery( purchase.blog_id ) );
	const wpcomDomain =
		siteDomains?.find( ( d ) => d.wpcom_domain || d.is_wpcom_staging_domain )?.domain ?? null;
	const { data: cancellationOffers } = useQuery(
		cancellationOffersQuery( purchase.blog_id, purchase.ID )
	);
	const { data: userPreferenceForSurveyComplete, isPending: userPreferencesQueryIsPending } =
		useQuery( userPreferenceQuery( getCancelPurchaseSurveyCompletedPreferenceKey( purchase.ID ) ) );
	const userHasCompletedCancelSurveyForPurchase = Boolean( userPreferenceForSurveyComplete );

	// Mutations (continued)
	const extendWithFreeMonthMutation = useMutation( extendPurchaseWithFreeMonthMutation() );
	const surveyCompletedMutator = useMutation(
		userPreferenceMutation( getCancelPurchaseSurveyCompletedPreferenceKey( purchase.ID ) )
	);
	const {
		mutateAsync: applyCancellationOffer,
		isPending: isApplyingOffer,
		isSuccess: offerApplySuccess,
		error: offerApplyError,
	} = useMutation( applyCancellationOfferMutation( purchase.blog_id, purchase.ID ) );
	const marketingSurveyMutate = useMutation( marketingSurveyMutation() );

	// Handler helpers
	const purchases = purchase && sitePurchases;
	const includedDomainPurchase = getIncludedDomainPurchase( purchases ?? [], purchase );

	const productSlug = purchase ? purchase.product_slug : null;
	const isAkismet = purchase ? isAkismetProduct( purchase ) : false;

	const navigate = useNavigate();
	const redirectBack = useCallback( () => {
		if (
			purchase &&
			( ! purchase.can_disable_auto_renew ||
				purchase.product_slug === DomainProductSlugs.TRANSFER_IN )
		) {
			navigate( { to: purchaseSettingsRoute.fullPath, params: { purchaseId: purchase.ID } } );
			return;
		}

		navigate( { to: purchasesRoute.to } );
	}, [ purchase, navigate ] );

	const track = useCallback( () => {
		if ( productSlug ) {
			recordTracksEvent( 'calypso_cancel_purchase_purchase_view', {
				product_slug: productSlug,
			} );
		}
	}, [ productSlug, recordTracksEvent ] );
	const cancelPurchaseSurveyCompleted = () => {
		surveyCompletedMutator.mutate( 'true' );
	};
	const flowType = getPurchaseCancellationFlowType( purchase );
	// Intent is set when the user clicks either Cancel or Remove on Purchase
	// Settings (behind the split cancel/remove experiment). When present,
	// it drives both the screen variant (copy) and the backend mutation.
	// When absent (flag-off, old deep link), fall back to today's flowType heuristic.
	const cancelSearch = useSearch( { from: cancelPurchaseRoute.fullPath } );
	const intent = getCancelIntentFromSearch( cancelSearch );
	const displayVariant = getDisplayVariant( intent, flowType );
	const getCancelledSearch = () => ( {
		cancelled: true as const,
		...( intent === 'auto-renew' ? { intent: 'auto-renew' as const } : {} ),
	} );
	const mutationFlowType = getMutationFlowType( intent, purchase );

	const cancellationOffer = cancellationOffers?.length ? cancellationOffers[ 0 ] : undefined;

	let questionOneOrder = [];
	let questionTwoOrder = [];

	const downgradePlan = getDowngradePlanForPurchase( plans, purchase, state.upsell );
	const yearlyPlanSlug = getYearlyPlanSlug( plans, purchase );

	const getActiveMarketplaceSubscriptions = (): Purchase[] => {
		if ( ! purchase.is_plan || ! productsList ) {
			return [];
		}

		const subs =
			purchases.filter( ( _purchase ) =>
				hasMarketplaceProduct( Object.values( productsList ), _purchase.product_slug )
			) ?? [];
		return subs;
	};

	const allSteps = getAllSurveySteps( {
		purchase,
		upsell: state.upsell,
		cancellationOffer,
		hasQuestionTwo: Boolean( state.questionTwoOrder?.length ),
		plans,
		userHasCompletedCancelSurveyForPurchase: isSplitCancelRemoveEnabled
			? false
			: userHasCompletedCancelSurveyForPurchase,
		isSplitCancelRemoveEnabled,
	} );

	const initSurveyState = () => {
		if ( state.initialized ) {
			return;
		}

		questionOneOrder = shuffleArray( cancellationOptionsForPurchase( purchase ) );
		questionTwoOrder = shuffleArray( nextAdventureOptionsForPurchase( purchase ) );
		questionOneOrder.push( 'anotherReasonOne' );

		if ( questionTwoOrder.length > 0 ) {
			questionTwoOrder.push( 'anotherReasonTwo' );
		}

		const [ firstStep ] = allSteps;

		const hasExpired = purchase.expiry_status === 'expired';
		// When intent is URL-sourced (user clicked Cancel or Remove on Purchase
		// Settings), the pre-survey confirmation MUST render first — regardless
		// of prior survey completion cache or expired state. The existing
		// short-circuit (surveyShown: true when REMOVE_PLAN_STEP is first, or
		// when expired) bypasses our confirmation screen. Gate it on intent
		// absence so flag-on users always see the matching confirmation.
		const shortCircuitToSurvey = REMOVE_PLAN_STEP === firstStep || hasExpired;
		const surveyShownInitial = intent ? false : shortCircuitToSurvey;

		const newState: CancelPurchaseState = {
			...initialSurveyState(),
			atomicRevertCheckOne: false,
			atomicRevertCheckTwo: false,
			atomicRevertConfirmed: false,
			cancelBundledDomain: false,
			confirmCancelBundledDomain: false,
			confirmationPassed: false,
			customerConfirmedUnderstanding: false,
			domainConfirmationConfirmed: false,
			initialized: true,
			isLoading: ! surveyShownInitial,
			isNextAdventureValid: false,
			isSubmitting: false,
			questionOneOrder,
			questionOneRadio: '',
			questionOneText: '',
			questionThreeRadio: '',
			questionThreeText: '',
			questionTwoOrder,
			questionTwoRadio: '',
			questionTwoText: '',
			showDomainOptionsStep: false,
			siteId: undefined,
			solution: '',
			surveyShown: surveyShownInitial,
			surveyStep: firstStep,
			upsell: '',
		};
		if ( JSON.stringify( state ) !== JSON.stringify( newState ) ) {
			setState( newState );
		}
	};

	// Handlers
	const onDialogClose = () => {
		setState( ( state ) => ( {
			...state,
			isLoading: false,
		} ) );
	};

	const closeMarketplaceSubscriptionsDialog = () => {
		setState( ( state ) => ( { ...state, isShowingMarketplaceSubscriptionsDialog: false } ) );
		onDialogClose();
	};

	const showMarketplaceDialog = () => {
		setState( ( state ) => ( { ...state, isShowingMarketplaceSubscriptionsDialog: true } ) );
	};

	const atomicRevertOnClickCheckOne = ( isChecked: boolean ) =>
		setState( ( state ) => ( { ...state, atomicRevertCheckOne: isChecked } ) );

	const atomicRevertOnClickCheckTwo = ( isChecked: boolean ) =>
		setState( ( state ) => ( { ...state, atomicRevertCheckTwo: isChecked } ) );

	const setStateBasedOnExtendedStatus = useCallback( async () => {
		const newState: Partial< CancelPurchaseState > = {};
		if ( hasBeenExtended && newState.upsell === 'free-month-offer' ) {
			newState.upsell = '';
		}
		setState( ( state ) => ( {
			...state,
			...newState,
		} ) );
	}, [ hasBeenExtended ] );

	const recordEvent = useCallback(
		( name: string, properties: Record< string, unknown > = {} ) => {
			recordTracksEvent( name, {
				cancellation_flow: flowType,
				product_slug: purchase.product_slug,
				is_atomic: site?.is_wpcom_atomic,

				...properties,
			} );
		},
		[ flowType, purchase.product_slug, recordTracksEvent, site ]
	);

	// Because of the legacy reason, we can't just use `flowType` here.
	// Instead we have to map it to the data keys defined way before `flowType` is introduced.
	const getSurveyDataType = () => {
		switch ( flowType ) {
			case CANCEL_FLOW_TYPE.REMOVE:
				return 'remove';
			case CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND:
				return 'refund';
			case CANCEL_FLOW_TYPE.CANCEL_AUTORENEW:
				return 'cancel-autorenew';
			default:
				// Although we shouldn't allow it to reach here, we still include this default in case we forgot to add proper mappings.
				return 'general';
		}
	};
	const changeSurveyStep = useCallback(
		( stepName: string ) => {
			setState( ( state ) => ( { ...state, surveyStep: stepName } ) );

			// Include upsell information when tracking the upsell step
			const eventProperties: { new_step: string; upsell_type?: string } = { new_step: stepName };
			if ( stepName === UPSELL_STEP && state.upsell ) {
				eventProperties.upsell_type = state.upsell;
			}

			recordEvent( 'calypso_purchases_cancel_survey_step', eventProperties );
		},
		[ recordEvent, state.upsell ]
	);
	const offerDiscountBasedFromPurchasePrice = getOfferDiscountBasedOnPurchasePrice(
		purchase,
		cancellationOffer
	);
	const onGetCancellationOffer = useCallback(
		( newPurchaseId?: string ) => {
			if ( ! newPurchaseId ) {
				redirectBack();
				return;
			}
			recordEvent( 'calypso_purchases_cancel_get_discount' );
			navigate( { to: purchasesRoute.to + `/${ newPurchaseId }` } );
		},
		[ redirectBack, navigate, recordEvent ]
	);

	const onClickAcceptForCancellationOffer = useCallback( () => {
		// is the offer being claimed/ is there already a success or error
		if ( ! isApplyingOffer && offerApplySuccess === false && ! offerApplyError ) {
			applyCancellationOffer().then( ( data ) => {
				if ( data.success ) {
					onGetCancellationOffer( data.new_purchase_id ); // Takes care of analytics.
				} else {
					redirectBack();
				}
			} );
		}
	}, [
		redirectBack,
		isApplyingOffer,
		offerApplySuccess,
		offerApplyError,
		applyCancellationOffer,
		onGetCancellationOffer,
	] );

	if ( offerApplyError ) {
		createErrorNotice( __( 'There was an error getting the discount!' ), { type: 'snackbar' } );
	}

	const recordClickRadioEvent = ( option: string, value: string ) => {
		recordTracksEvent( 'calypso_purchases_cancel_form_select_radio_option', {
			option,
			value,
		} );
	};

	const onRadioOneChange = ( eventOrValue: string | ChangeEvent< HTMLInputElement > ) => {
		const value = typeof eventOrValue === 'string' ? eventOrValue : eventOrValue.target.value;
		recordClickRadioEvent( 'radio_1', value );

		setState( ( state ) => ( {
			...state,
			questionOneRadio: value,
			questionOneText: '',
			upsell: '',
		} ) );
	};

	const downgradeClick = () => {
		if ( ! state.isSubmitting ) {
			if ( ! downgradePlan ) {
				createErrorNotice( __( 'Cannot find a plan to downgrade to.' ), { type: 'snackbar' } );
				return;
			}

			setState( ( state ) => ( { ...state, isLoading: true } ) );

			cancelAndRefundMutation.mutate(
				{
					purchaseId: purchase.ID,
					options: {
						type: 'downgrade',
						to_product_id: downgradePlan.product_id,
					},
				},
				{
					onSuccess: ( response ) => {
						setState( ( state ) => ( { ...state, isLoading: false } ) );
						createSuccessNotice( response.message, { type: 'snackbar' } );
						navigate( { to: purchasesRoute.to } );
					},
					onError: ( error ) => {
						setState( ( state ) => ( { ...state, isLoading: false, isSubmitting: false } ) );
						createErrorNotice( error.message, { type: 'snackbar' } );
					},
				}
			);
			recordEvent( 'calypso_purchases_downgrade_form_submit' );
			setState( ( state ) => ( { ...state, solution: 'downgrade', isSubmitting: true } ) );
		}
	};

	const onSwitchToMonthly = async () => {
		if ( state.isSubmitting ) {
			return;
		}

		const monthlyPlan = getDowngradePlanForPurchase( plans, purchase, 'downgrade-monthly' );
		if ( ! monthlyPlan ) {
			createErrorNotice( __( 'Failed to switch to monthly billing.' ), { type: 'snackbar' } );
			return;
		}

		setState( ( state ) => ( { ...state, isLoading: true, isSubmitting: true } ) );
		recordEvent( 'calypso_purchases_downgrade_form_submit' );

		try {
			await cancelAndRefundMutation.mutateAsync( {
				purchaseId: purchase.ID,
				options: {
					type: 'downgrade',
					to_product_id: monthlyPlan.product_id,
				},
			} );

			// Fetch the refreshed purchases list to find the new monthly purchase.
			const freshPurchases = await queryClient.fetchQuery( userPurchasesQuery() );
			const newPurchase = freshPurchases?.find( ( p: Purchase ) => {
				return p.product_id === monthlyPlan.product_id && p.blog_id === purchase.blog_id;
			} );

			if ( newPurchase ) {
				navigate( {
					to: purchaseSettingsRoute.fullPath,
					params: { purchaseId: newPurchase.ID },
					search: { downgraded: true },
				} );
			} else {
				// Fallback: new purchase not found (eventual consistency edge case).
				createSuccessNotice( __( 'Your plan has been switched to monthly billing.' ), {
					type: 'snackbar',
				} );
				navigate( { to: purchasesRoute.to } );
			}
		} catch ( error ) {
			createErrorNotice( ( error as Error ).message, { type: 'snackbar' } );
		} finally {
			setState( ( state ) => ( { ...state, isLoading: false, isSubmitting: false } ) );
		}
	};

	const freeMonthOfferClick = async () => {
		if ( ! state.isSubmitting ) {
			setState( ( state ) => ( { ...state, isLoading: true } ) );

			extendWithFreeMonthMutation.mutate( purchase.ID, {
				onSuccess: ( response ) => {
					if ( response.status === 'completed' ) {
						// refreshSitePlans( purchase.blog_id );
						// clearPurchases();
						createSuccessNotice( response.message, { type: 'snackbar' } );
						navigate( { to: purchasesRoute.to } );
					}
					setState( ( state ) => ( { ...state, isLoading: false } ) );
				},
				onError: ( error ) => {
					createErrorNotice( ( error as Error ).message, { type: 'snackbar' } );
					setState( ( state ) => ( { ...state, isLoading: false } ) );
				},
			} );
			recordEvent( 'calypso_purchases_free_month_offer_form_submit' );
			setState( ( state ) => ( { ...state, solution: 'free-month-offer', isSubmitting: true } ) );
		}
	};

	const onCancelConfirmationStateChange = ( newState: Partial< CancelPurchaseState > ) => {
		setState( ( state ) => ( {
			...state,
			...newState,
		} ) );
	};

	const cancelAllMarketplaceSubscriptions = () => {
		const cancelAndRefundActiveSubscriptions: Purchase[] = [];
		const cancelActiveSubscriptions: Purchase[] = [];
		const marketplaceSubscriptions = getActiveMarketplaceSubscriptions();
		marketplaceSubscriptions.forEach( ( subscription ) => {
			if ( hasAmountAvailableToRefund( subscription ) ) {
				cancelAndRefundActiveSubscriptions.push( subscription );
			} else {
				cancelActiveSubscriptions.push( subscription );
			}
		} );
		cancelAndRefundActiveSubscriptions.forEach( ( marketplaceSubscription ) => {
			cancelAndRefundMutation.mutate(
				{
					purchaseId: marketplaceSubscription.ID,
					options: {
						product_id: marketplaceSubscription.product_id,
						cancel_bundled_domain: false,
					},
				},
				{
					onError: ( error: Error ) => {
						createErrorNotice( ( error as Error ).message, { type: 'snackbar' } );
					},
				}
			);
		} );
		cancelActiveSubscriptions.forEach( ( marketplaceSubscription ) => {
			setPurchaseAutoRenewMutation.mutate(
				{ purchaseId: marketplaceSubscription.ID, autoRenew: false },
				{
					onError: () => {
						const purchaseName = marketplaceSubscription.product_name;
						createErrorNotice(
							sprintf(
								/* translators: %(purchaseName)s is the name of the product that was purchased. */
								__(
									'There was a problem canceling %(purchaseName)s. Please try again later or contact support.'
								),
								{ purchaseName }
							),
							{ type: 'snackbar' }
						);
						setState( ( state ) => ( { ...state, surveyShown: false, isLoading: false } ) );
					},
				}
			);
		} );
	};

	// Single source of truth for the effective flow when intent is URL-sourced
	// (Purchase Settings Cancel/Remove buttons), the eligibility banner sets
	// refund intent, or the treatment banner forces auto-renew off on the
	// default Cancel of a refundable plan. Takes cancelIntent as a parameter
	// so confirm-click callers can pass the fresh value before setState commits.
	const computeEffectiveFlowType = (
		cancelIntent: CancelPurchaseState[ 'cancelIntent' ]
	): CancelFlowType => {
		if ( intent ) {
			return mutationFlowType;
		}
		if ( cancelIntent === 'refund' ) {
			return CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND;
		}
		if ( flowType === CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND && isSplitCancelRemoveEnabled ) {
			return CANCEL_FLOW_TYPE.CANCEL_AUTORENEW;
		}
		return mutationFlowType;
	};

	// Fire the cancel mutation at confirm-time and only advance to the survey
	// once it resolves. The snackbar is deferred to onSurveyComplete so it
	// shows on the destination (purchase management) screen, not mid-survey.
	// Survicate stays tied to mutation success — a background analytics
	// concern the user doesn't see in the UI.
	const fireMutationFromConfirm = async (
		effectiveFlowType: CancelFlowType,
		cancelBundledDomain?: boolean
	) => {
		try {
			await fireMutationOnConfirm( effectiveFlowType, cancelBundledDomain );
			invokeSurvicateEvent( 'purchaseCancelled' );
			setState( ( state ) => ( {
				...state,
				confirmationPassed: true,
				surveyShown: true,
				isLoading: false,
			} ) );
		} catch ( error ) {
			createErrorNotice( ( error as Error ).message, { type: 'snackbar' } );
			// Stay on the confirmation page so the user can retry or back out.
		}
	};

	// Fire-on-confirm applies to the URL-intent Cancel and Auto-renew paths —
	// the user clicked "Cancel" on Purchase Settings or toggled off auto-renew,
	// and we want the mutation to settle before the survey appears (so the
	// heading can read "Cancellation confirmed" / "Auto-renew disabled"). Remove
	// (and the no-intent legacy deep link) defer the mutation to onSurveyComplete.
	const shouldFireMutationOnConfirm = (): boolean =>
		isSplitCancelRemoveEnabled && ( intent === 'cancel' || intent === 'auto-renew' );

	const onCancellationComplete = () => {
		recordTracksEvent( 'calypso_purchases_cancel_form_start', {
			cancellation_flow: flowType,
			product_slug: purchase.product_slug,
			is_atomic: site?.is_wpcom_atomic ?? false,
			user_lang: locale,
		} );
		const effectiveFlowType = computeEffectiveFlowType( state.cancelIntent );
		// Cancel intent fires the mutation now and only advances to the survey
		// after it resolves — see fireMutationFromConfirm. Remove (and any non-
		// intent path) defers to onSurveyComplete and navigates to the survey
		// synchronously.
		if ( shouldFireMutationOnConfirm() ) {
			fireMutationFromConfirm( effectiveFlowType, state.cancelBundledDomain ?? false );
			return;
		}
		setState( ( state ) => ( {
			...state,
			confirmationPassed: true,
			surveyShown: true,
			isLoading: false,
		} ) );
	};

	const onCancellationStart = ( cancelIntent: CancelPurchaseState[ 'cancelIntent' ] = null ) => {
		// When the eligibility notice is active and the user clicks the default cancel button
		// (not the refund link), they're opting for an auto-renew cancellation — no refund, so
		// no need to ask about the domain. Skip straight to the survey.
		const skippingDomainOptionsForAutoRenew =
			isSplitCancelRemoveEnabled && cancelIntent !== 'refund';

		const needsDomainOptions =
			! skippingDomainOptionsForAutoRenew &&
			includedDomainPurchase &&
			willShowDomainOptionsRadioButtons( includedDomainPurchase, purchase );

		if ( needsDomainOptions ) {
			setState( ( state ) => ( {
				...state,
				cancelIntent,
				siteId: purchase.blog_id,
				showDomainOptionsStep: true,
			} ) );
		} else {
			recordTracksEvent( 'calypso_purchases_cancel_form_start', {
				cancellation_flow: flowType,
				product_slug: purchase.product_slug,
				is_atomic: site?.is_wpcom_atomic ?? false,
				user_lang: locale,
			} );
			const effectiveFlowType = computeEffectiveFlowType( cancelIntent );
			// See onCancellationComplete for the rationale on why the cancel
			// intent path defers surveyShown until the mutation resolves.
			if ( shouldFireMutationOnConfirm() ) {
				setState( ( state ) => ( {
					...state,
					cancelIntent,
					siteId: purchase.blog_id,
				} ) );
				fireMutationFromConfirm( effectiveFlowType );
				return;
			}
			setState( ( state ) => ( {
				...state,
				cancelIntent,
				confirmationPassed: true,
				siteId: purchase.blog_id,
				surveyShown: true,
			} ) );
		}
	};

	const clickNext = () => {
		changeSurveyStep( nextStep( state.surveyStep ?? '', allSteps ) );
	};

	const closeDialog = () => {
		initSurveyState();
		recordEvent( 'calypso_purchases_cancel_form_close' );
	};

	const onDomainConfirmationChange = ( checked: boolean ) => {
		setState( ( state ) => ( {
			...state,
			domainConfirmationConfirmed: checked,
		} ) );

		// Record tracks event for domain confirmation checkbox
		recordTracksEvent( 'calypso_purchases_domain_confirmation_checkbox', {
			product_slug: purchase.product_slug,
			purchase_id: purchase.ID,
			checked,
		} );
	};

	const onKeepSubscriptionClick = () => {
		recordTracksEvent( 'calypso_purchases_keep_subscription', {
			product_slug: purchase.product_slug,
			purchase_id: purchase.ID,
		} );
	};

	const handleMarketplaceDialogContinue = () => {
		// Close the marketplace dialog
		closeMarketplaceSubscriptionsDialog();

		// Show the appropriate survey based on purchase type
		onCancellationStart();
	};

	const onTextOneChange = (
		eventOrValue: string | ChangeEvent< HTMLInputElement >,
		detailsValue?: string
	) => {
		const value = typeof eventOrValue === 'string' ? eventOrValue : eventOrValue.target.value;
		const { questionOneDetails } = state;

		// Only fire the tracking event if this is a dropdown selection (detailsValue is undefined)
		if ( detailsValue === undefined && value && value !== '' ) {
			recordClickRadioEvent( 'radio_1_2', value );
		}

		const upsellType = getUpsellType( value, purchase, {
			canDowngrade: !! downgradeClick,
			canOfferFreeMonth: !! freeMonthOfferClick && ! hasBeenExtended && ! purchase.is_refundable,
		} );
		const hasSolutionsCards =
			isSplitCancelRemoveEnabled && ( getSolutionsForReason( value )?.length ?? 0 ) > 0;

		setState( ( state ) => ( {
			...state,
			questionOneText: value,
			questionOneDetails: detailsValue || questionOneDetails,
			upsell: upsellType || ( hasSolutionsCards ? 'solutions-cards' : '' ),
		} ) );
	};

	const onRadioTwoChange = ( eventOrValue: string | ChangeEvent< HTMLInputElement > ) => {
		const value = typeof eventOrValue === 'string' ? eventOrValue : eventOrValue.target.value;
		recordClickRadioEvent( 'radio_2', value );

		setState( ( state ) => ( {
			...state,
			questionTwoRadio: value,
			questionTwoText: '',
		} ) );
	};

	const onTextTwoChange = ( eventOrValue: string | ChangeEvent< HTMLInputElement > ) => {
		const value = typeof eventOrValue === 'string' ? eventOrValue : eventOrValue.target.value;
		setState( ( state ) => ( {
			...state,
			questionTwoText: value,
		} ) );
	};

	const onTextThreeChange = ( eventOrValue: string | ChangeEvent< HTMLInputElement > ) => {
		const value = typeof eventOrValue === 'string' ? eventOrValue : eventOrValue.target.value;
		setState( ( state ) => ( {
			...state,
			questionThreeText: value,
		} ) );
	};

	const onImportRadioChange = ( eventOrValue: string | ChangeEvent< HTMLInputElement > ) => {
		const value = typeof eventOrValue === 'string' ? eventOrValue : eventOrValue.target.value;
		recordClickRadioEvent( 'import_radio', value );

		setState( ( state ) => ( {
			...state,
			importQuestionRadio: value,
		} ) );
	};

	const onNextAdventureValidationChange = ( isValid: boolean ) => {
		setState( ( state ) => ( { ...state, isNextAdventureValid: isValid } ) );
	};

	const submitMarketingSurvey = ( surveyDetails: MarketingSurveyDetails ) =>
		marketingSurveyMutate.mutate( surveyDetails, {
			onSuccess: () => {
				setState( ( state ) => ( {
					...state,
					isSubmitting: false,
				} ) );
			},
			onError: ( error ) => {
				setState( ( state ) => ( {
					...state,
					isSubmitting: false,
				} ) );
				removeNotice( 'submit_marketing_survey_notice' );
				createErrorNotice( error.message, {
					type: 'snackbar',
					id: 'submit_marketing_survey_notice',
				} );
			},
		} );

	const activeSubscriptions = getActiveMarketplaceSubscriptions();
	const shouldHandleMarketplaceSubscriptions = () => {
		return activeSubscriptions?.length > 0;
	};

	const submitCancelAndRefundPurchase = ( purchase: Purchase ) => {
		const refundable = hasAmountAvailableToRefund( purchase );
		if ( refundable ) {
			cancelAndRefundMutation.mutate(
				{
					purchaseId: purchase.ID,
					options: {
						product_id: purchase.product_id,
						cancel_bundled_domain: state.cancelBundledDomain ?? false,
						email_variant: isSplitCancelRemoveEnabled ? 'treatment' : 'control',
					},
				},
				{
					onSuccess: () => {
						if ( purchase.is_plan ) {
							cancelAllMarketplaceSubscriptions();
						}
						invokeSurvicateEvent( 'purchaseRefunded' );
						navigate( {
							to: purchaseSettingsRoute.fullPath,
							params: { purchaseId: purchase.ID },
							search: { refunded: true },
						} );
					},
					onError: ( error: Error ) => {
						createErrorNotice( ( error as Error ).message, { type: 'snackbar' } );
					},
				}
			);
			return;
		}

		setPurchaseAutoRenewMutation.mutate(
			{ purchaseId: purchase.ID, autoRenew: false },
			{
				onSuccess: () => {
					navigate( {
						to: purchaseSettingsRoute.fullPath,
						params: { purchaseId: purchase.ID },
						search: getCancelledSearch(),
					} );
				},
				onError: () => {
					const purchaseName = ( purchase.is_domain ? purchase.meta : purchase.product_name ) ?? '';
					createErrorNotice(
						sprintf(
							/* translators: %(purchaseName)s is the name of the product that was purchased. */
							__(
								'There was a problem canceling %(purchaseName)s. Please try again later or contact support.'
							),
							{ purchaseName }
						),
						{ type: 'snackbar' }
					);
					setState( ( state ) => ( { ...state, surveyShown: false, isLoading: false } ) );
				},
			}
		);
	};

	const submitRemovePurchase = ( purchase: Purchase ) => {
		if ( CANCEL_FLOW_TYPE.REMOVE !== flowType ) {
			return;
		}

		setTimeout( () => {
			// 1. Optimistic cache strip
			const stripPurchaseFromList = () => {
				queryClient.setQueryData( userPurchasesQuery().queryKey, ( old: Purchase[] | undefined ) =>
					( old ?? [] ).filter( ( p ) => p.ID !== purchase.ID )
				);
			};

			stripPurchaseFromList();

			// 2. Cache guard — re-strip if a stale refetch brings the purchase back.
			// Pattern: packages/api-queries/src/site-collision-listener.ts
			let guardActive = true;
			let processing = false;

			const unsubscribeGuard = queryClient
				.getQueryCache()
				.subscribe( ( event: QueryCacheNotifyEvent ) => {
					if (
						! guardActive ||
						processing ||
						event.type !== 'updated' ||
						event.action.type !== 'success' ||
						event.query.queryKey[ 0 ] !== 'upgrades'
					) {
						return;
					}

					const data = event.query.state.data as Purchase[] | undefined;
					if ( data?.some( ( p ) => p.ID === purchase.ID ) ) {
						processing = true;
						try {
							stripPurchaseFromList();
						} finally {
							processing = false;
						}
					}
				} );

			const cleanupGuard = () => {
				if ( ! guardActive ) {
					return;
				}
				guardActive = false;
				unsubscribeGuard();
			};

			// Self-terminate after 15s with a final authoritative fetch
			setTimeout( () => {
				cleanupGuard();
				queryClient.invalidateQueries( { queryKey: userPurchasesQuery().queryKey } );
			}, CACHE_GUARD_DURATION_MS );

			// 3. Navigate with notice params
			invokeSurvicateEvent( 'purchaseRemoved' );
			const productNoun = getProductNounForCategory( classifyPurchaseForCopy( purchase ) );
			navigate( {
				to: purchasesRoute.to,
				search: {
					removed: productNoun,
					removedId: purchase.ID,
					...( purchase.will_atomic_revert_after_removal
						? { removedDomain: purchase.domain }
						: {} ),
				},
			} );

			// 4. Fire mutation in background. On failure, restore the purchase to
			//    the cache — the list watches userPurchasesQuery for reappearance
			//    and self-dismisses its notice. The cache guard's re-strip happens
			//    synchronously inside the QueryCache notify callback, so the list's
			//    useEffect never observes transient successes-path reappearances.
			removePurchaseMutator.mutateAsync( purchase.ID ).catch( () => {
				cleanupGuard();
				queryClient.setQueryData(
					userPurchasesQuery().queryKey,
					( old: Purchase[] | undefined ) => {
						const list = old ?? [];
						return list.some( ( p ) => p.ID === purchase.ID ) ? list : [ ...list, purchase ];
					}
				);
				createErrorNotice( __( 'Failed to remove your purchase. Please try again.' ), {
					type: 'snackbar',
				} );
				queryClient.invalidateQueries( { queryKey: userPurchasesQuery().queryKey } );
			} );
		}, 1500 );
	};

	const submitTurnOffAutoRenew = ( purchase: Purchase ) => {
		setPurchaseAutoRenewMutation.mutate(
			{ purchaseId: purchase.ID, autoRenew: false },
			{
				onSuccess: () => {
					invokeSurvicateEvent( 'purchaseCancelled' );
					navigate( {
						to: purchaseSettingsRoute.fullPath,
						params: { purchaseId: purchase.ID },
						search: getCancelledSearch(),
					} );
				},
				onError: () => {
					const purchaseName = ( purchase.is_domain ? purchase.meta : purchase.product_name ) ?? '';
					createErrorNotice(
						sprintf(
							/* translators: %(purchaseName)s is the name of the product that was purchased. */
							__(
								'There was a problem canceling %(purchaseName)s. Please try again later or contact support.'
							),
							{ purchaseName }
						),
						{ type: 'snackbar' }
					);
					setState( ( state ) => ( { ...state, surveyShown: false, isLoading: false } ) );
				},
			}
		);
	};

	const onSurveyComplete = () => {
		// Set loading state to show busy button
		setState( ( state ) => ( { ...state, isLoading: true } ) );

		const effectiveFlowType = computeEffectiveFlowType( state.cancelIntent );

		if ( shouldFireMutationOnConfirm() ) {
			// Cancel intent: the mutation already fired at confirm-click via
			// fireMutationFromConfirm. Navigate with the appropriate search param
			// so the inline notice renders on the destination screen.
			navigate( {
				to: purchaseSettingsRoute.fullPath,
				params: { purchaseId: purchase.ID },
				search:
					effectiveFlowType === CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND
						? { refunded: true }
						: getCancelledSearch(),
			} );
			return;
		}

		switch ( effectiveFlowType ) {
			case CANCEL_FLOW_TYPE.REMOVE:
				submitRemovePurchase( purchase );
				break;
			case CANCEL_FLOW_TYPE.CANCEL_AUTORENEW:
				submitTurnOffAutoRenew( purchase );
				break;
			case CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND:
				submitCancelAndRefundPurchase( purchase );
				break;
		}
	};

	const onSubmit = () => {
		setState( ( state ) => ( {
			...state,
			solution: '',
			isSubmitting: true,
		} ) );

		const hasSubOption = state.questionOneDetails && state.questionOneText;
		const responseValue = hasSubOption ? state.questionOneDetails : state.questionOneRadio;

		const surveyData = {
			'why-cancel': {
				response: responseValue,
				text: state.questionOneText,
			},
			'next-adventure': {
				response: state.questionTwoRadio,
				text: state.questionTwoText,
			},
			'what-better': { text: state.questionThreeText },
			'import-satisfaction': { response: state.importQuestionRadio },
			type: getSurveyDataType(),
		};

		submitMarketingSurvey( {
			survey_id: 'calypso-remove-purchase',
			site_id: purchase.blog_id,
			survey_responses: enrichedSurveyData( surveyData, purchase ),
		} );

		if ( flowType === CANCEL_FLOW_TYPE.CANCEL_AUTORENEW && ! isSplitCancelRemoveEnabled ) {
			cancelPurchaseSurveyCompleted();
		}

		if ( onSurveyComplete ) {
			onSurveyComplete();
		}

		recordEvent( 'calypso_purchases_cancel_form_submit' );
	};

	const createdErrorNoticeForRedirect = useRef< boolean >();

	const isDataLoading =
		siteFeaturesQueryIsPending ||
		( ! lastSiteQueryIsError.current && siteQueryIsPending ) ||
		purchaseQueryIsPending ||
		( Boolean( purchase.meta ) && domainQueryIsPending ) ||
		siteLatestAtomicTransferQueryIsPending ||
		productsQueryIsPending ||
		userPreferencesQueryIsPending;

	const isDataValid = useCallback( () => {
		if ( isDataLoading ) {
			return true;
		}

		if ( ! purchase ) {
			if ( ! createdErrorNoticeForRedirect.current ) {
				createErrorNotice( __( 'Something went wrong. Please contact support.' ), {
					type: 'snackbar',
				} );
				createdErrorNoticeForRedirect.current = true;
			}
			return false;
		}

		// Under the split flag, if intent=cancel/auto-renew but auto-renew is
		// already off (e.g. page refresh after the mutation), redirect to
		// Purchase Settings instead of re-showing the confirmation screen.
		// Bypass when surveyShown is true — the post-mutation survey should
		// still render within the same session.
		const isAlreadyCancelledForSplitFlag =
			isSplitCancelRemoveEnabled &&
			( intent === 'cancel' || intent === 'auto-renew' ) &&
			! purchase.is_auto_renew_enabled;

		if ( isAlreadyCancelledForSplitFlag && ! state.surveyShown ) {
			return false;
		}

		if ( ! purchase.is_cancelable && state.surveyShown ) {
			return true;
		}

		if (
			! purchase.can_disable_auto_renew &&
			! purchase.is_cancelable &&
			! purchase.is_removable
		) {
			if ( purchase.subscription_status !== 'active' && ! createdErrorNoticeForRedirect.current ) {
				createErrorNotice(
					__(
						'This purchase has already been removed. Please contact support if you believe this to be in error.'
					),
					{ type: 'snackbar' }
				);
				createdErrorNoticeForRedirect.current = true;
			}
			if (
				isOneTimePurchase( purchase ) &&
				! purchase.is_refundable &&
				! createdErrorNoticeForRedirect.current
			) {
				createErrorNotice(
					__(
						'This one time purchase cannot be cancelled. Please contact support if you need assistance.'
					),
					{ type: 'snackbar' }
				);
				createdErrorNoticeForRedirect.current = true;
			}
			if ( ! createdErrorNoticeForRedirect.current ) {
				createErrorNotice(
					__(
						'This product cannot be cancelled or removed. Please contact support if you need assistance.'
					),
					{ type: 'snackbar' }
				);
				createdErrorNoticeForRedirect.current = true;
			}
			return false;
		}

		return true;
	}, [
		createErrorNotice,
		intent,
		isDataLoading,
		isSplitCancelRemoveEnabled,
		purchase,
		state.surveyShown,
	] );

	const didRunEffect = useRef< boolean >( false );

	// componentDidMount
	useEffect( () => {
		if ( didRunEffect.current ) {
			return;
		}
		if ( purchase.ID && purchase.bill_period_days === SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD ) {
			setStateBasedOnExtendedStatus();
		}
		if ( ! isDataValid() ) {
			redirectBack();
			return;
		}
		track();
		didRunEffect.current = true;
	}, [
		setStateBasedOnExtendedStatus,
		isDataValid,
		purchase.ID,
		purchase.bill_period_days,
		purchase.product_slug,
		redirectBack,
		track,
		createErrorNotice,
	] );

	// componentDidUpdate
	useEffect( () => {
		if ( productSlug ) {
			track();
		}
	}, [ track, productSlug ] );
	useEffect( () => {
		if ( state.surveyShown ) {
			return;
		}
		if ( ! isDataValid() ) {
			redirectBack();
			return;
		}
		if ( state.isLoading && ! isDataLoading ) {
			setState( ( state ) => ( {
				...state,
				isLoading: isDataLoading,
			} ) );
		}
	}, [
		isDataLoading,
		isDataValid,
		state.surveyShown,
		redirectBack,
		state.isLoading,
		createErrorNotice,
	] );

	if ( ! isDataValid() ) {
		return null;
	}

	const isImport = Boolean( site && ( site?.options?.import_engine ?? false ) );
	const hasBackupsFeature = siteFeatures?.active?.indexOf( 'backups' ) >= 0;
	const siteSlug = purchase.site_slug ?? site?.slug ?? '';

	if ( ! state?.initialized && purchase ) {
		initSurveyState();
	}

	if ( isDataLoading ) {
		return <PageLayout size="small" />;
	}

	const isHundredYearDomain = selectedDomain?.is_hundred_year_domain ?? false;

	const onCustomerConfirmedUnderstandingChange = ( checked: boolean ) => {
		setState( ( state ) => ( { ...state, customerConfirmedUnderstanding: checked } ) );
	};

	const onCustomerConfirmedUnderstandingAtomicPlanRevert = ( checked: boolean ) => {
		setState( ( state ) => ( { ...state, atomicRevertConfirmed: checked } ) );
	};

	if ( isHundredYearDomain ) {
		redirectBack();
		return null;
	}

	const planName = purchase.is_domain_registration ? purchase.meta : purchase.product_name;
	const isDomainRemoval = flowType === CANCEL_FLOW_TYPE.REMOVE && purchase.is_domain_registration;

	if ( isDomainRemoval && ! isSplitCancelRemoveEnabled ) {
		return (
			<PageLayout
				size="small"
				header={
					<PageHeader
						title={ <CancelHeaderTitle displayVariant={ displayVariant } purchase={ purchase } /> }
						prefix={ <Breadcrumbs length={ 4 } /> }
						description={ __( 'Please confirm that you want to remove this domain.' ) }
					/>
				}
			>
				<Card>
					<CardBody>
						<DomainRemovalFlow purchase={ purchase } onCancel={ redirectBack } />
					</CardBody>
				</Card>
			</PageLayout>
		);
	}

	const cancellationOfferDescription = sprintf(
		/* Translators: %(brand)s is either Akismet or Jetpack */
		__(
			'We’d love to help make %(brand)s work for you. Would the special offer below interest you?'
		),
		{
			brand: isAkismet ? 'Akismet' : 'Jetpack',
		}
	);
	const description =
		state.surveyStep === CANCELLATION_OFFER_STEP ? cancellationOfferDescription : null;
	const isSolutionsStep =
		state.surveyStep === UPSELL_STEP &&
		isSplitCancelRemoveEnabled &&
		( getSolutionsForReason( state.questionOneText ?? '' )?.length ?? 0 ) > 0;
	// Under the split cancel/remove experiment the pre-survey confirmation screen
	// gates the survey on `confirmationPassed`. Flag-off keeps the legacy
	// `surveyShown` gate.
	const atSurvey = Boolean(
		isSplitCancelRemoveEnabled ? state.confirmationPassed : state.surveyShown
	);
	const form = (
		<CancelPurchaseForm
			atomicRevertCheckOne={ state.atomicRevertCheckOne }
			atomicRevertCheckTwo={ state.atomicRevertCheckTwo }
			atomicRevertOnClickCheckOne={ atomicRevertOnClickCheckOne }
			atomicRevertOnClickCheckTwo={ atomicRevertOnClickCheckTwo }
			atomicTransfer={ atomicTransfer }
			cancelBundledDomain={ state.cancelBundledDomain }
			cancellationInProgress={ state.isLoading || isMutationPending }
			cancellationOffer={ cancellationOffer }
			intent={ intent }
			clickNext={ clickNext }
			closeDialog={ closeDialog }
			disableButtons={ state.isLoading || isMutationPending }
			downgradeClick={ downgradeClick }
			downgradePlan={ downgradePlan }
			flowType={ flowType }
			freeMonthOfferClick={ freeMonthOfferClick }
			onSwitchToMonthly={ onSwitchToMonthly }
			hasBackupsFeature={ hasBackupsFeature }
			importQuestionRadio={ state.importQuestionRadio }
			includedDomainPurchase={ includedDomainPurchase }
			isAkismet={ isAkismet }
			isApplyingOffer={ isApplyingOffer }
			isImport={ isImport }
			isNextAdventureValid={ state.isNextAdventureValid }
			isShowing={ state.isShowingMarketplaceSubscriptionsDialog }
			isSubmitting={ state.isSubmitting }
			isVisible={ atSurvey }
			offerDiscountBasedFromPurchasePrice={ offerDiscountBasedFromPurchasePrice }
			onClickAcceptForCancellationOffer={ onClickAcceptForCancellationOffer }
			onGetCancellationOffer={ onGetCancellationOffer }
			onImportRadioChange={ onImportRadioChange }
			onNextAdventureValidationChange={ onNextAdventureValidationChange }
			onRadioOneChange={ onRadioOneChange }
			onRadioTwoChange={ onRadioTwoChange }
			onSubmit={ onSubmit }
			onSurveyComplete={ onSurveyComplete }
			onTextOneChange={ onTextOneChange }
			onTextThreeChange={ onTextThreeChange }
			onTextTwoChange={ onTextTwoChange }
			plans={ plans }
			purchase={ purchase }
			questionOneOrder={ state.questionOneOrder }
			questionOneRadio={ state.questionOneRadio }
			questionOneText={ state.questionOneText }
			questionTwoOrder={ state.questionTwoOrder }
			questionTwoRadio={ state.questionTwoRadio }
			questionTwoText={ state.questionTwoText }
			refundAmount={ purchase.total_refund_amount }
			siteSlug={ siteSlug }
			solution={ state.solution }
			surveyStep={ state.surveyStep }
			allSteps={ allSteps }
			upsell={ state.upsell }
			yearlyPlanSlug={ yearlyPlanSlug }
		/>
	);
	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={
						<CancelHeaderTitle
							displayVariant={ displayVariant }
							purchase={ purchase }
							surveyStep={ state.surveyStep }
							surveyShown={ state.surveyShown }
						/>
					}
					prefix={ <Breadcrumbs length={ 4 } /> }
					description={ description }
				/>
			}
			notices={ renderTopNotice( {
				surveyShown: state.surveyShown,
				showDomainOptionsStep: state.showDomainOptionsStep,
				displayVariant,
				purchase,
				intent,
				isSplitCancelRemoveEnabled,
			} ) }
		>
			{ isSolutionsStep ? (
				form
			) : (
				<Card>
					<CardBody>
						<VStack spacing={ 6 }>
							{ form }
							{ ! atSurvey && (
								<CancellationPreSurveyContent
									purchase={ purchase }
									displayVariant={ displayVariant }
									includedDomainPurchase={ includedDomainPurchase }
									atomicTransfer={ atomicTransfer }
									selectedDomain={ selectedDomain }
									site={ site }
									wpcomDomain={ wpcomDomain }
									activeMarketplaceSubscriptions={ activeSubscriptions }
									state={ state }
									purchaseCancelFeatures={ purchaseCancelFeatures }
									isBusy={ isMutationPending }
									onCancelConfirmationStateChange={ onCancelConfirmationStateChange }
									onDomainConfirmationChange={ onDomainConfirmationChange }
									onCustomerConfirmedUnderstandingChange={ onCustomerConfirmedUnderstandingChange }
									onCustomerConfirmedUnderstandingAtomicPlanRevert={
										onCustomerConfirmedUnderstandingAtomicPlanRevert
									}
									onKeepSubscriptionClick={ onKeepSubscriptionClick }
									onCancellationComplete={ onCancellationComplete }
									onCancellationStart={ onCancellationStart }
									shouldHandleMarketplaceSubscriptions={ shouldHandleMarketplaceSubscriptions }
									showMarketplaceDialog={ showMarketplaceDialog }
								/>
							) }
							{ shouldHandleMarketplaceSubscriptions() && (
								<MarketPlaceSubscriptionsDialog
									activeSubscriptions={ activeSubscriptions }
									bodyParagraphText={ _n(
										'This subscription will be cancelled. It will be removed when it expires.',
										'These subscriptions will be cancelled. They will be removed when they expire.',
										activeSubscriptions.length
									) }
									closeDialog={ closeMarketplaceSubscriptionsDialog }
									isDialogVisible
									planName={ planName ?? '' }
									/* Translators: This button cancels the active plan and all active Marketplace subscriptions on the site */
									primaryButtonText={ __( 'Continue' ) }
									removePlan={ handleMarketplaceDialogContinue }
									/* Translators: %(plan)s is the name of the plan being cancelled */
									sectionHeadingText={ sprintf( __( 'Cancel %(plan)s' ), {
										plan: planName ?? '',
									} ) }
								/>
							) }
						</VStack>
					</CardBody>
				</Card>
			) }
		</PageLayout>
	);
}
