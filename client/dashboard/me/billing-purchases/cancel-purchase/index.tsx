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
	sitePurchasesQuery,
	userPreferenceMutation,
	hasPurchaseBeenExtendedQuery,
	siteLatestAtomicTransferQuery,
	siteFeaturesQuery,
	removePurchaseMutation,
	userPreferenceQuery,
} from '@automattic/api-queries';
import { useSuspenseQuery, useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { _n, sprintf, __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { intlFormat } from 'date-fns';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import Breadcrumbs from '../../../app/breadcrumbs';
import { cancelPurchaseRoute, purchaseSettingsRoute, purchasesRoute } from '../../../app/router/me';
import { Card, CardBody } from '../../../components/card';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { shuffleArray } from '../../../utils/collection';
import {
	CANCEL_FLOW_TYPE,
	CancelFlowType,
	getIncludedDomainPurchase,
	getPurchaseCancellationFlowType,
	hasAmountAvailableToRefund,
	hasMarketplaceProduct,
	isAgencyPartnerType,
	isAkismetTemporarySitePurchase,
	isExpired,
	isGSuiteOrGoogleWorkspaceProductSlug,
	isJetpackTemporarySitePurchase,
	isAkismetProduct,
	isPartnerPurchase,
	isOneTimePurchase,
	shouldShowRefundEligibilityNotice,
} from '../../../utils/purchase';
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
	OFFER_ACCEPTED_STEP,
	REMOVE_PLAN_STEP,
	UPSELL_STEP,
} from './cancel-purchase-form/steps';
import CancellationPreSurveyContent from './cancellation-pre-survey-content';
import DomainRemovalFlow from './domain-removal-flow';
import enrichedSurveyData from './enriched-survey-data';
import { getUpsellType } from './get-upsell-type';
import initialSurveyState from './initial-survey-state';
import MarketPlaceSubscriptionsDialog from './marketplace-subscriptions-dialog';
import nextStep from './next-step';
import RefundEligibilityNotice from './refund-eligibility-notice';
import TimeRemainingNotice from './time-remaining-notice';
import type { CancelPurchaseState } from './types';
import type {
	Purchase,
	MarketingSurveyDetails,
	PlanProduct,
	UserPreferences,
} from '@automattic/api-core';
import type { ChangeEvent } from 'react';
import './style.scss';

const willShowDomainOptionsRadioButtons = (
	includedDomainPurchase: Purchase,
	purchase: Purchase
) => {
	return (
		includedDomainPurchase.is_domain_registration &&
		purchase.is_refundable &&
		!! includedDomainPurchase.cost_to_unbundle_display
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

function availableJetpackSurveySteps(
	purchase: Purchase,
	flowType: CancelFlowType,
	cancellationOffer: CancellationOffer | undefined
): string[] {
	const availableSteps = [];

	// If the plan is already expired or is a temporary Jetpack purchase (license),
	// we only need one "confirm" step for the survey is the removal confirmation
	// A product that is not in use does not need to collect the survey or show benefits
	if ( isExpired( purchase ) || isJetpackTemporarySitePurchase( purchase ) ) {
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
		const isOfferPriceSameOrLowerThanPurchasePrice = cancellationOffer
			? purchase.amount >= cancellationOffer.original_price
			: false;
		const offerDiscountBasedFromPurchasePrice = getOfferDiscountBasedOnPurchasePrice(
			purchase,
			cancellationOffer
		);

		availableSteps.push( FEEDBACK_STEP );
		if ( isOfferPriceSameOrLowerThanPurchasePrice && offerDiscountBasedFromPurchasePrice >= 10 ) {
			availableSteps.push( CANCELLATION_OFFER_STEP );
		}
	}

	return availableSteps;
}

function getBasicSurveySteps( {
	purchase,
	upsell,
	cancellationOffer,
	hasQuestionTwo,
	plans,
}: {
	purchase: Purchase;
	upsell: CancelPurchaseState[ 'upsell' ];
	cancellationOffer: CancellationOffer | undefined;
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
		return availableJetpackSurveySteps( purchase, flowType, cancellationOffer );
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
}: {
	purchase: Purchase;
	upsell: CancelPurchaseState[ 'upsell' ];
	cancellationOffer: CancellationOffer | undefined;
	hasQuestionTwo: boolean;
	plans: PlanProduct[];
	userHasCompletedCancelSurveyForPurchase: boolean;
} ): string[] {
	let steps = getBasicSurveySteps( {
		purchase,
		upsell,
		cancellationOffer,
		hasQuestionTwo,
		plans,
	} );
	const skipRemovePlanSurvey = purchase.is_plan && userHasCompletedCancelSurveyForPurchase;
	const flowType = getPurchaseCancellationFlowType( purchase );

	if ( purchase.will_atomic_revert_after_removal && flowType === CANCEL_FLOW_TYPE.REMOVE ) {
		steps.push( ATOMIC_REVERT_STEP );
	}

	// If the survey has already been completed, then remove certain steps and make `REMOVE_PLAN_STEP` the first step.
	if ( skipRemovePlanSurvey ) {
		const stepsToRemove = [ FEEDBACK_STEP, NEXT_ADVENTURE_STEP ];
		steps = steps.filter( ( step ) => ! stepsToRemove.includes( step ) );
		steps = [ REMOVE_PLAN_STEP, ...steps ];
	}

	return steps;
}

export default function CancelPurchase() {
	const { createSuccessNotice, removeNotice, createErrorNotice } = useDispatch( noticesStore );
	const { recordTracksEvent } = useAnalytics();
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
	const { data: purchase, isPending: purchaseQueryIsPending } = useSuspenseQuery(
		purchaseQuery( parseInt( purchaseId ) )
	);
	const { data: sitePurchases } = useSuspenseQuery( sitePurchasesQuery( purchase.blog_id ) );
	const { data: siteFeatures, isPending: siteFeaturesQueryIsPending } = useSuspenseQuery(
		siteFeaturesQuery( purchase.blog_id )
	);
	const { data: plans } = useSuspenseQuery( plansQuery() );
	const { data: purchaseCancelFeatures } = useQuery( purchaseCancelFeaturesQuery( purchaseId ) );

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
	const { data: cancellationOffers } = useQuery(
		cancellationOffersQuery( purchase.blog_id, purchase.ID )
	);
	const { data: userPreferenceForSurveyComplete, isPending: userPreferencesQueryIsPending } =
		useQuery( userPreferenceQuery( getCancelPurchaseSurveyCompletedPreferenceKey( purchase.ID ) ) );
	const userHasCompletedCancelSurveyForPurchase = Boolean( userPreferenceForSurveyComplete );

	// Mutations
	const cancelAndRefundPurchaseMutate = useMutation( cancelAndRefundPurchaseMutation() );
	const setPurchaseAutoRenewMutation = useMutation( userPurchaseSetAutoRenewQuery() );
	const cancelAndRefundMutation = useMutation( cancelAndRefundPurchaseMutation() );
	const removePurchaseMutator = useMutation( removePurchaseMutation() );
	const extendWithFreeMonthMutation = useMutation( extendPurchaseWithFreeMonthMutation() );
	const surveyCompletedMutator = useMutation(
		userPreferenceMutation( getCancelPurchaseSurveyCompletedPreferenceKey( purchase.ID ) )
	);
	const {
		mutate: applyCancellationOffer,
		isPending: isApplyingOffer,
		isSuccess: offerApplySuccess,
		error: offerApplyError,
	} = useMutation( applyCancellationOfferMutation( purchase.blog_id, purchase.ID ) );
	const marketingSurveyMutate = useMutation( marketingSurveyMutation() );

	// Handler helpers
	const purchases = purchase && sitePurchases;
	const includedDomainPurchase = getIncludedDomainPurchase( purchases ?? [], purchase );

	const productSlug = purchase ? purchase.product_slug : null;

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

	const cancellationOffer = cancellationOffers?.length ? cancellationOffers[ 0 ] : undefined;

	let questionOneOrder = [];
	let questionTwoOrder = [];

	const downgradePlan = getDowngradePlanForPurchase( plans, purchase, state.upsell );

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
		hasQuestionTwo: Boolean( questionTwoOrder.length ),
		plans,
		userHasCompletedCancelSurveyForPurchase,
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

		const newState: CancelPurchaseState = {
			...initialSurveyState(),
			atomicRevertCheckOne: false,
			atomicRevertCheckTwo: false,
			atomicRevertConfirmed: false,
			cancelBundledDomain: false,
			confirmCancelBundledDomain: false,
			customerConfirmedUnderstanding: false,
			domainConfirmationConfirmed: false,
			initialized: true,
			isLoading: REMOVE_PLAN_STEP !== firstStep && ! hasExpired,
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
			surveyShown: REMOVE_PLAN_STEP === firstStep || hasExpired,
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
	const onGetCancellationOffer = useCallback( () => {
		changeSurveyStep( OFFER_ACCEPTED_STEP );
		recordEvent( 'calypso_purchases_cancel_get_discount' );
	}, [ changeSurveyStep, recordEvent ] );

	const onClickAcceptForCancellationOffer = useCallback( () => {
		// is the offer being claimed/ is there already a success or error
		if ( ! isApplyingOffer && offerApplySuccess === false && ! offerApplyError ) {
			applyCancellationOffer();
			onGetCancellationOffer(); // Takes care of analytics.
		}
	}, [
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

			cancelAndRefundPurchaseMutate.mutate(
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

	const onCancellationComplete = () => {
		setState( ( state ) => ( {
			...state,
			surveyShown: true,
			isLoading: false,
		} ) );
	};

	const onCancellationStart = (
		cancelIntent: CancelPurchaseState[ 'cancelIntent' ] = null,
		customerConfirmedUnderstanding = false
	) => {
		// When the eligibility notice is active and the user clicks the default cancel button
		// (not the refund link), they're opting for an auto-renew cancellation — no refund, so
		// no need to ask about the domain. Skip straight to the survey.
		const skippingDomainOptionsForAutoRenew =
			shouldShowRefundEligibilityNotice( purchase ) && cancelIntent !== 'refund';

		const needsDomainOptions =
			! skippingDomainOptionsForAutoRenew &&
			includedDomainPurchase &&
			willShowDomainOptionsRadioButtons( includedDomainPurchase, purchase );

		if ( needsDomainOptions ) {
			setState( ( state ) => ( {
				...state,
				cancelIntent,
				customerConfirmedUnderstanding,
				siteId: purchase.blog_id,
				showDomainOptionsStep: true,
			} ) );
		} else {
			setState( ( state ) => ( {
				...state,
				cancelIntent,
				customerConfirmedUnderstanding,
				siteId: purchase.blog_id,
				surveyShown: true,
			} ) );
		}
	};

	const onCancellationStartForRefund = () => {
		// Explicitly clicking the refund notice button is the user's confirmation — skip the
		// confirmation checkbox that would otherwise be required on the pre-survey screen.
		onCancellationStart( 'refund', true );
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
			// customerConfirmedUnderstanding: checked,
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

		setState( ( state ) => ( {
			...state,
			questionOneText: value,
			questionOneDetails: detailsValue || questionOneDetails,
			upsell:
				getUpsellType( value, purchase, {
					canDowngrade: !! downgradeClick,
					canOfferFreeMonth:
						!! freeMonthOfferClick && ! hasBeenExtended && ! purchase.is_refundable,
				} ) || '',
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

	const cancelAllMarketplaceSubscriptions = () => {
		const cancelAndRefundActiveSubscriptions: Purchase[] = [];
		const cancelActiveSubscriptions: Purchase[] = [];
		const marketplaceSubscriptions = getActiveMarketplaceSubscriptions();
		marketplaceSubscriptions.forEach( ( subscription ) => {
			hasAmountAvailableToRefund( subscription )
				? cancelAndRefundActiveSubscriptions.push( subscription )
				: cancelActiveSubscriptions.push( subscription );
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

	const submitCancelAndRefundPurchase = ( purchase: Purchase ) => {
		const refundable = hasAmountAvailableToRefund( purchase );
		if ( refundable ) {
			cancelAndRefundMutation.mutate(
				{
					purchaseId: purchase.ID,
					options: {
						product_id: purchase.product_id,
						cancel_bundled_domain: state.cancelBundledDomain ?? false,
					},
				},
				{
					onSuccess: () => {
						if ( purchase.is_plan ) {
							cancelAllMarketplaceSubscriptions();
						}
						createSuccessNotice(
							__( 'Your refund has been processed and your purchase removed.' ),
							{
								type: 'snackbar',
							}
						);
						navigate( {
							to: purchaseSettingsRoute.fullPath,
							params: { purchaseId: purchase.ID },
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
					const purchaseName = purchase.is_domain ? purchase.meta : purchase.product_name;
					const subscriptionEndDate = intlFormat(
						purchase.expiry_date,
						{ dateStyle: 'medium' },
						{ locale: 'en-US' }
					);
					createSuccessNotice(
						sprintf(
							/* translators: %(purchaseName)s is the name of the product that was purchased, %(subscriptionEndDate)s is the date the product will no longer be available because the subscription has ended */
							__(
								'%(purchaseName)s was successfully cancelled. It will be available for use until it expires on %(subscriptionEndDate)s.'
							),
							{
								purchaseName,
								subscriptionEndDate,
							}
						),
						{ type: 'snackbar' }
					);
					navigate( {
						to: purchaseSettingsRoute.fullPath,
						params: { purchaseId: purchase.ID },
					} );
				},
				onError: () => {
					const purchaseName = purchase.is_domain ? purchase.meta : purchase.product_name;
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

		removePurchaseMutator.mutate( purchase.ID, {
			onSuccess: () => {
				const purchaseName = purchase.is_domain ? purchase.meta : purchase.product_name;
				/* translators: %(productName)s is the name of a product (e.g., "WordPress.com Premium") and %(siteName)s is a domain name */
				let successMessage = sprintf( __( '%(productName)s was removed from %(siteName)s.' ), {
					productName: purchaseName,
					siteName: purchase.domain,
				} );
				if (
					isAkismetTemporarySitePurchase( purchase ) ||
					isJetpackTemporarySitePurchase( purchase )
				) {
					/* translators: %(productName)s is the name of a product (e.g., "WordPress.com Premium") */
					successMessage = sprintf( __( '%(productName)s was removed from your account.' ), {
						productName: purchaseName,
					} );
				}
				if ( purchase.is_domain_registration ) {
					successMessage = sprintf(
						/* translators: %(domain)s is a domain name */
						__( 'The domain %(domain)s was removed from your account.' ),
						{
							domain: purchaseName,
						}
					);
				}
				createSuccessNotice( successMessage, { type: 'snackbar' } );
				navigate( {
					to: purchaseSettingsRoute.fullPath,
					params: { purchaseId: purchase.ID },
				} );
			},
			onError: () => {
				const purchaseName = purchase.is_domain ? purchase.meta : purchase.product_name;
				createErrorNotice(
					sprintf(
						/* translators: %(purchaseName)s is the name of the product that was purchased. */
						__(
							'There was a problem removing %(purchaseName)s. Please try again later or contact support.'
						),
						{ purchaseName }
					),
					{ type: 'snackbar' }
				);
				setState( ( state ) => ( { ...state, surveyShown: false, isLoading: false } ) );
			},
		} );
	};

	const submitTurnOffAutoRenew = ( purchase: Purchase ) => {
		setPurchaseAutoRenewMutation.mutate(
			{ purchaseId: purchase.ID, autoRenew: false },
			{
				onSuccess: () => {
					const purchaseName = purchase.is_domain ? purchase.meta : purchase.product_name;
					const subscriptionEndDate = intlFormat(
						purchase.expiry_date,
						{ dateStyle: 'medium' },
						{ locale: 'en-US' }
					);
					createSuccessNotice(
						sprintf(
							/* translators: %(purchaseName)s is the name of the product that was purchased, %(subscriptionEndDate)s is the date the product will no longer be available because the subscription has ended */
							__(
								'%(purchaseName)s was successfully cancelled. It will be available for use until it expires on %(subscriptionEndDate)s.'
							),
							{
								purchaseName,
								subscriptionEndDate,
							}
						),
						{ type: 'snackbar' }
					);
					navigate( {
						to: purchaseSettingsRoute.fullPath,
						params: { purchaseId: purchase.ID },
					} );
				},
				onError: () => {
					const purchaseName = purchase.is_domain ? purchase.meta : purchase.product_name;
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

		// Determine effective flow type based on cancel intent
		let effectiveFlowType = flowType;

		// If user clicked refund button, use refund flow
		if ( state.cancelIntent === 'refund' ) {
			effectiveFlowType = CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND;
		}
		// If default Cancel button on refundable wpcom plan, use auto-renew flow
		else if (
			flowType === CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND &&
			shouldShowRefundEligibilityNotice( purchase )
		) {
			effectiveFlowType = CANCEL_FLOW_TYPE.CANCEL_AUTORENEW;
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

		if ( flowType === CANCEL_FLOW_TYPE.CANCEL_AUTORENEW ) {
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
	}, [ createErrorNotice, isDataLoading, purchase, state.surveyShown ] );

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

	if ( isHundredYearDomain ) {
		redirectBack();
		return null;
	}

	const isAkismet = isAkismetProduct( purchase );
	const planName = purchase.is_domain_registration ? purchase.meta : purchase.product_name;
	const isDomainRemoval = flowType === CANCEL_FLOW_TYPE.REMOVE && purchase.is_domain_registration;

	if ( isDomainRemoval ) {
		return (
			<PageLayout
				size="small"
				header={
					<PageHeader
						title={ <CancelHeaderTitle flowType={ flowType } purchase={ purchase } /> }
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

	const offerDiscountBasedFromPurchasePrice = getOfferDiscountBasedOnPurchasePrice(
		purchase,
		cancellationOffer
	);
	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ <CancelHeaderTitle flowType={ flowType } purchase={ purchase } /> }
					prefix={ <Breadcrumbs length={ 4 } /> }
				/>
			}
			notices={
				! state.surveyShown &&
				! state.showDomainOptionsStep &&
				( shouldShowRefundEligibilityNotice( purchase ) ? (
					<RefundEligibilityNotice
						purchase={ purchase }
						onClaimRefund={ onCancellationStartForRefund }
					/>
				) : (
					<TimeRemainingNotice purchase={ purchase } />
				) )
			}
		>
			<Card>
				<CardBody>
					<VStack spacing={ 6 }>
						<CancelPurchaseForm
							atomicRevertCheckOne={ state.atomicRevertCheckOne }
							atomicRevertCheckTwo={ state.atomicRevertCheckTwo }
							atomicRevertOnClickCheckOne={ atomicRevertOnClickCheckOne }
							atomicRevertOnClickCheckTwo={ atomicRevertOnClickCheckTwo }
							atomicTransfer={ atomicTransfer }
							cancelBundledDomain={ state.cancelBundledDomain }
							cancellationInProgress={ state.isLoading }
							cancellationOffer={ cancellationOffer }
							clickNext={ clickNext }
							closeDialog={ closeDialog }
							disableButtons={ state.isLoading }
							downgradeClick={ downgradeClick }
							downgradePlan={ downgradePlan }
							flowType={ flowType }
							freeMonthOfferClick={ freeMonthOfferClick }
							hasBackupsFeature={ hasBackupsFeature }
							importQuestionRadio={ state.importQuestionRadio }
							includedDomainPurchase={ includedDomainPurchase }
							isAkismet={ isAkismet }
							isApplyingOffer={ isApplyingOffer }
							isImport={ isImport }
							isNextAdventureValid={ state.isNextAdventureValid }
							isShowing={ state.isShowingMarketplaceSubscriptionsDialog }
							isSubmitting={ state.isSubmitting }
							isVisible={ state.surveyShown }
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
						/>
						{ ! state.surveyShown && (
							<CancellationPreSurveyContent
								purchase={ purchase }
								includedDomainPurchase={ includedDomainPurchase }
								atomicTransfer={ atomicTransfer }
								selectedDomain={ selectedDomain }
								state={ state }
								purchaseCancelFeatures={ purchaseCancelFeatures }
								onCancelConfirmationStateChange={ onCancelConfirmationStateChange }
								onDomainConfirmationChange={ onDomainConfirmationChange }
								onCustomerConfirmedUnderstandingChange={ onCustomerConfirmedUnderstandingChange }
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
								sectionHeadingText={ sprintf( __( 'Cancel %(plan)s' ), { plan: planName } ) }
							/>
						) }
					</VStack>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
