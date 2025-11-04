import { DomainProductSlugs, SubscriptionBillPeriod } from '@automattic/api-core';
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
	userPreferencesMutation,
	hasPurchaseBeenExtendedQuery,
	siteLatestAtomicTransferQuery,
	siteFeaturesQuery,
} from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { localizeUrl } from '@automattic/i18n-utils';
import { formatCurrency } from '@automattic/number-formatters';
import { useSuspenseQuery, useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
	Button,
	CheckboxControl,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { _n, __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { formatDistanceToNow, intervalToDuration, intlFormat } from 'date-fns';
import { useCallback, useEffect, useRef, useMemo, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import Breadcrumbs from '../../../app/breadcrumbs';
import { useLocale } from '../../../app/locale';
import { cancelPurchaseRoute, purchaseSettingsRoute, purchasesRoute } from '../../../app/router/me';
import { ButtonStack } from '../../../components/button-stack';
import { Card } from '../../../components/card';
import Notice from '../../../components/notice';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { shuffleArray } from '../../../utils/collection';
import { getGSuiteSubscriptionStatus, getGoogleMailServiceFamily } from '../../../utils/gsuite';
import {
	CANCEL_FLOW_TYPE,
	getIncludedDomainPurchase,
	getPurchaseCancellationFlowType,
	hasAmountAvailableToRefund,
	hasMarketplaceProduct,
	isAgencyPartnerType,
	isAkismetProduct,
	isExpired,
	isGSuiteOrGoogleWorkspaceProductSlug,
	isJetpackTemporarySitePurchase,
	isNonDomainSubscription,
	isOneTimePurchase,
	isPartnerPurchase,
	willAtomicSiteRevertAfterPurchaseDeactivation,
} from '../../../utils/purchase';
import BackupRetentionOptionOnCancelPurchase from './backup-retention-management/retention-option-on-cancel-purchase';
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
	UPSELL_STEP,
} from './cancel-purchase-form/steps';
import CancelPurchaseDomainOptions from './domain-options';
import enrichedSurveyData from './enriched-survey-data';
import CancelPurchaseFeatureList from './feature-list';
import { getUpsellType } from './get-upsell-type';
import initialSurveyState from './initial-survey-state';
import MarketPlaceSubscriptionsDialog from './marketplace-subscriptions-dialog';
import nextStep from './next-step';
import CancelPurchaseRefundInformation from './refund-information';
import type { CancelPurchaseState } from './types';
import type { Purchase, MarketingSurveyDetails, PlanProduct } from '@automattic/api-core';
import type { ChangeEvent } from 'react';
import './style.scss';

// Helper function to determine if radio buttons will be shown
const willShowDomainOptionsRadioButtons = (
	includedDomainPurchase: Purchase,
	purchase: Purchase
) => {
	return (
		includedDomainPurchase.is_domain_registration &&
		purchase.is_refundable &&
		includedDomainPurchase.is_refundable
	);
};

export default function CancelPurchase() {
	const { createSuccessNotice, removeNotice, createErrorNotice } = useDispatch( noticesStore );
	const { recordTracksEvent } = useAnalytics();
	const locale = useLocale();
	const [ state, setState ] = useState< CancelPurchaseState >( {
		questionOneOrder: [],
		initialized: false,
	} );
	const { purchaseId } = cancelPurchaseRoute.useParams();

	// Queries
	const { data: purchase, isPending: purchaseQueryIsPending } = useSuspenseQuery(
		purchaseQuery( parseInt( purchaseId ) )
	);
	const { data: sitePurchases } = useSuspenseQuery( sitePurchasesQuery( purchase.blog_id ) );
	const { data: products } = useSuspenseQuery( productsQuery() );
	const { data: siteFeatures, isPending: siteFeaturesQueryIsPending } = useSuspenseQuery(
		siteFeaturesQuery( purchase.blog_id )
	);
	const { data: plans } = useSuspenseQuery( plansQuery( '', locale ) );
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

	// Mutations
	const cancelAndRefundPurchaseMutate = useMutation( cancelAndRefundPurchaseMutation() );
	const setPurchaseAutoRenewMutation = useMutation( userPurchaseSetAutoRenewQuery() );
	const cancelAndRefundMutation = useMutation( cancelAndRefundPurchaseMutation() );
	const extendWithFreeMonthMutation = useMutation( extendPurchaseWithFreeMonthMutation() );
	const userPreferences = useMutation( userPreferencesMutation() );
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
	const redirect = useCallback( () => {
		if (
			purchase &&
			( ! purchase.can_disable_auto_renew ||
				purchase.product_slug === DomainProductSlugs.TRANSFER_IN )
		) {
			navigate( { to: purchaseSettingsRoute.fullPath, params: { purchaseId: purchase.ID } } );
			return;
		}

		createErrorNotice( 'test', { type: 'snackbar' } );
		navigate( { to: purchasesRoute.to } );
	}, [ purchase, navigate, createErrorNotice ] );

	const track = useCallback( () => {
		if ( productSlug ) {
			recordTracksEvent( 'calypso_cancel_purchase_purchase_view', {
				product_slug: productSlug,
			} );
		}
	}, [ productSlug, recordTracksEvent ] );
	const savePreference = ( key: string | number, value: unknown ) => () => {
		const payload = {
			[ 'calypso_preferences' ]: {
				[ key ]: value,
			},
		};
		userPreferences.mutate( payload );
	};
	const flowType = getPurchaseCancellationFlowType( purchase );

	const shouldProvideCancellationOffer = config.isEnabled( 'cancellation-offers' );

	const cancellationOffer = cancellationOffers?.length ? cancellationOffers[ 0 ] : undefined;
	const isOfferPriceSameOrLowerThanPurchasePrice = cancellationOffer
		? purchase.amount >= cancellationOffer.original_price
		: false;
	const offerDiscountBasedFromPurchasePrice = useMemo( () => {
		if ( cancellationOffer ) {
			const offerDiscountPercentage = ( 1 - cancellationOffer.raw_price / purchase.amount ) * 100;

			// Round the cancellation offer discount percentage to the nearest whole number
			return Math.round( offerDiscountPercentage );
		}
		return 0;
	}, [ cancellationOffer, purchase ] );

	const availableJetpackSurveySteps = useCallback( () => {
		const availableSteps = [];

		// If the plan is already expired or is a temporary Jetpack purchase (license),
		// we only need one "confirm" step for the survey is the removal confirmation
		// A product that is not in use does not need to collect the survey or show benefits
		if ( isExpired( purchase ) || isJetpackTemporarySitePurchase( purchase ) ) {
			return [ CANCEL_CONFIRM_STEP ];
		}

		// Always include the survey step if cancellation is completed, or if it's a normal cancellation flow
		if (
			// props.cancellationCompleted ||
			CANCEL_FLOW_TYPE.CANCEL_AUTORENEW === flowType ||
			CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND === flowType
		) {
			availableSteps.push( FEEDBACK_STEP );
		}

		if ( CANCEL_FLOW_TYPE.REMOVE === flowType ) {
			availableSteps.push( FEEDBACK_STEP );
			if (
				shouldProvideCancellationOffer &&
				cancellationOffer &&
				isOfferPriceSameOrLowerThanPurchasePrice &&
				offerDiscountBasedFromPurchasePrice >= 10
			) {
				availableSteps.push( CANCELLATION_OFFER_STEP );
			}
		}

		return availableSteps;
	}, [
		cancellationOffer,
		flowType,
		isOfferPriceSameOrLowerThanPurchasePrice,
		offerDiscountBasedFromPurchasePrice,
		purchase,
		shouldProvideCancellationOffer,
	] );

	let questionOneOrder = [];
	let questionTwoOrder = [];

	const getAllSurveySteps = useCallback( () => {
		let steps = [ FEEDBACK_STEP ];
		const isJetpack = purchase.is_jetpack_plan_or_product;

		if (
			isPartnerPurchase( purchase ) &&
			purchase.partner_type &&
			isAgencyPartnerType( purchase.partner_type )
		) {
			steps = [];
		} else if ( isJetpack ) {
			steps = availableJetpackSurveySteps();
		} else if ( purchase.is_domain_registration ) {
			steps = [ FEEDBACK_STEP, NEXT_ADVENTURE_STEP ];
		} else if (
			! isGSuiteOrGoogleWorkspaceProductSlug( purchase.product_slug ) &&
			! purchase.is_plan
		) {
			steps = [ NEXT_ADVENTURE_STEP ];
		} else if ( state.upsell ) {
			steps = [ FEEDBACK_STEP, UPSELL_STEP, NEXT_ADVENTURE_STEP ];
		} else if ( questionTwoOrder?.length ) {
			steps = [ FEEDBACK_STEP, NEXT_ADVENTURE_STEP ];
		}

		if ( state.willAtomicSiteRevert && flowType === CANCEL_FLOW_TYPE.REMOVE ) {
			steps.push( ATOMIC_REVERT_STEP );
		}

		return steps;
	}, [
		purchase,
		availableJetpackSurveySteps,
		flowType,
		questionTwoOrder?.length,
		state.upsell,
		state.willAtomicSiteRevert,
	] );

	const getFeaturesFromApiForProduct = () => {
		return purchaseCancelFeatures?.features ?? [];
	};

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

		const allSteps = getAllSurveySteps();
		const [ firstStep ] = allSteps;

		const linkedPurchases: Purchase[] = getActiveMarketplaceSubscriptions();

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
			isLoading: true,
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
			surveyShown: false,
			surveyStep: firstStep,
			upsell: '',
			willAtomicSiteRevert: willAtomicSiteRevertAfterPurchaseDeactivation(
				purchase,
				sitePurchases,
				site,
				Object.values( products ),
				linkedPurchases
			),
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

	const getCancelPurchaseSurveyCompletedPreferenceKey = ( purchaseId: string | number ): string => {
		return `cancel-purchase-survey-completed-${ purchaseId }`;
	};

	const cancelPurchaseSurveyCompleted = ( purchaseId: number ) => () => {
		savePreference( getCancelPurchaseSurveyCompletedPreferenceKey( purchaseId ), true )();
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

	enum PurchaseDowngradeType {
		TermDowngrade = 'downgrade-term', // downgrade-monthly
		PlanDowngrade = 'downgrade-plan', // downgrade-personal
	}

	const getDowngradePlanForPurchase = (
		plans: PlanProduct[],
		purchase: Purchase,
		downgradeType: PurchaseDowngradeType
	): PlanProduct | undefined => {
		if ( ! plans ) {
			return;
		}
		const plan = plans.find( ( plan ) => plan.product_id === purchase.product_id );
		if ( ! plan ) {
			return;
		}

		let downgradePlanInfo;
		switch ( downgradeType ) {
			case PurchaseDowngradeType.TermDowngrade:
				downgradePlanInfo = plan.downgrade_paths.find( ( path ) => {
					path.bill_period !== plan.bill_period;
				} );
				break;
			case PurchaseDowngradeType.PlanDowngrade:
				downgradePlanInfo = plan.downgrade_paths.find( ( path ) => {
					path.bill_period === plan.bill_period;
				} );
				break;
		}
		if ( downgradePlanInfo ) {
			return plans.find( ( plan ) => plan.product_id === downgradePlanInfo.product_id );
		}
	};

	const downgradeClick = ( upsell: string ) => {
		if ( ! state.isSubmitting ) {
			let downgradePlan = undefined;
			if ( 'downgrade-monthly' === upsell ) {
				downgradePlan = getDowngradePlanForPurchase(
					plans,
					purchase,
					PurchaseDowngradeType.TermDowngrade
				);
			} else if ( 'downgrade-personal' === upsell ) {
				downgradePlan = getDowngradePlanForPurchase(
					plans,
					purchase,
					PurchaseDowngradeType.PlanDowngrade
				);
			}

			setState( ( state ) => ( { ...state, isLoading: true } ) );
			if ( ! downgradePlan ) {
				throw new Error( 'Cannot find a plan to downgrade to' );
			}

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
			newState,
		} ) );
	};

	const onCancellationComplete = () => {
		setState( ( state ) => ( {
			...state,
			surveyShown: true,
			isLoading: false,
		} ) );
	};

	const onCancellationStart = () => {
		// Only show domain options as a separate step if radio buttons will be displayed
		if (
			includedDomainPurchase &&
			willShowDomainOptionsRadioButtons( includedDomainPurchase, purchase )
		) {
			setState( ( state ) => ( {
				...state,
				siteId: purchase.blog_id,
				showDomainOptionsStep: true,
			} ) );
		} else {
			// For direct cancellations (no domain options step), show survey directly
			setState( ( state ) => ( { ...state, siteId: purchase.blog_id, surveyShown: true } ) );
		}
	};

	const clickNext = () => {
		changeSurveyStep( nextStep( state.surveyStep ?? '', getAllSurveySteps() ) );
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

	const handleCancelPurchaseClick = async () => {
		// For all purchases, including domain registrations, show the survey first
		// The API call will happen at the end of the survey flow

		// For other purchases, determine if we need domain options step
		// If onCancellationStart is null, we're already in the domain options step
		if ( ! onCancellationStart ) {
			// We're in the domain options step, show survey directly
			onCancellationComplete();
		} else {
			onCancellationStart();
		}
	};
	const handleMarketplaceDialogContinue = () => {
		// Close the marketplace dialog
		closeMarketplaceSubscriptionsDialog();

		// Show the appropriate survey based on purchase type
		handleCancelPurchaseClick();
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
					setState( ( state ) => ( { ...state, surveyShown: false, isLoading: false } ) );
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
		submitCancelAndRefundPurchase( purchase );
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
			cancelPurchaseSurveyCompleted( purchase.ID );
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
		productsQueryIsPending;

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

		const isValidForDisablingAutoRenew = purchase.can_disable_auto_renew;
		const isValidForCancellation = purchase.is_cancelable;
		// const isValidForRemoval = ! purchase.is_cancelable && purchase.is_removable;
		const isValidForRemoval = purchase.is_removable;

		if ( ! isValidForCancellation && state.surveyShown ) {
			return true;
		}

		if ( ! isValidForDisablingAutoRenew && isValidForCancellation && isValidForRemoval ) {
			if ( ! createdErrorNoticeForRedirect.current ) {
				createErrorNotice(
					__(
						'This purchase has already been removed. Please contact support if you believe this to be in error.'
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
			redirect();
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
		redirect,
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
			redirect();
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
		redirect,
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

	const isJetpack = purchase.is_jetpack_plan_or_product;
	const isAkismet = isAkismetProduct( purchase );
	const isDomainRegistrationPurchase = purchase && purchase.is_domain_registration;
	const isGSuite = isGSuiteOrGoogleWorkspaceProductSlug( purchase.product_slug );
	const isHundredYearDomain = selectedDomain?.is_hundred_year_domain ?? false;

	const renderRefundAmountString = (
		purchase: Purchase,
		cancelBundledDomain: boolean,
		includedDomainPurchase?: Purchase
	) => {
		const {
			refund_integer: refundInteger,
			total_refund_integer: totalRefundInteger,
			total_refund_currency: totalRefundCurrency,
		} = purchase;

		if ( hasAmountAvailableToRefund( purchase ) ) {
			if ( cancelBundledDomain && includedDomainPurchase ) {
				return formatCurrency( totalRefundInteger, totalRefundCurrency, {
					isSmallestUnit: true,
				} );
			}
			return formatCurrency( refundInteger, totalRefundCurrency, {
				isSmallestUnit: true,
			} );
		}

		return null;
	};

	const renderFullText = () => {
		const { expiry_date: expiryDate } = purchase;
		const expirationDate = intlFormat( expiryDate, { dateStyle: 'medium' }, { locale: 'en-US' } );

		const refundAmountString = renderRefundAmountString(
			purchase,
			state.cancelBundledDomain ?? false,
			includedDomainPurchase
		);

		if ( refundAmountString ) {
			return createInterpolateElement(
				sprintf(
					/* translators: $(refundText)s is of the form "[currency-symbol][amount]" i.e. "$20" */
					__(
						'If you confirm this cancellation, you will receive a <span>refund of %(refundText)s</span>, and your subscription will be removed immediately.'
					),
					{
						refundText: refundAmountString,
					}
				),
				{
					span: <span className="cancel-purchase__refund-string" />,
				}
			);
		}

		return createInterpolateElement(
			sprintf(
				/* translators: %(expirationDate)s is the date when the subscription will be removed */
				__(
					'If you complete this cancellation, your subscription will be removed on <span>%(expirationDate)s</span>.'
				),
				{
					expirationDate,
				}
			),
			{
				span: <span className="cancel-purchase__warning-string" />,
			}
		);
	};

	type RenderCancelButtonPropOverrides = {
		disabled?: boolean;
		isBusy?: boolean;
		onClick?: () => void;
	};
	const renderCancelButton = ( propOverrides: RenderCancelButtonPropOverrides = {} ) => {
		// Check if we need atomic revert confirmation
		const needsAtomicRevertConfirmation = atomicTransfer?.created_at;

		const isDisabled =
			propOverrides?.disabled ||
			( state.cancelBundledDomain && ! state.confirmCancelBundledDomain ) ||
			( state.surveyStep === ATOMIC_REVERT_STEP &&
				needsAtomicRevertConfirmation &&
				! state.atomicRevertConfirmed &&
				purchase.is_plan ) ||
			( isDomainRegistrationPurchase && ! state.domainConfirmationConfirmed ) ||
			! ( state?.customerConfirmedUnderstanding || false );

		const cancelButtonText = ( () => {
			if ( includedDomainPurchase ) {
				return __( 'Continue with cancellation' );
			}

			if ( hasAmountAvailableToRefund( purchase ) ) {
				if ( purchase.is_domain_registration ) {
					return __( 'Cancel domain and refund' );
				}
				if ( isNonDomainSubscription( purchase ) ) {
					return __( 'Cancel plan' );
				}
				if ( isOneTimePurchase( purchase ) ) {
					return __( 'Cancel and refund' );
				}
			}

			if ( purchase.is_domain_registration ) {
				return __( 'Cancel domain' );
			}

			if ( isNonDomainSubscription( purchase ) ) {
				return __( 'Cancel plan' );
			}
		} )();

		return (
			<Button
				className="cancel-purchase__button"
				disabled={ isDisabled }
				isBusy={ propOverrides?.isBusy ?? state.isLoading ?? false }
				onClick={
					propOverrides?.onClick ?? shouldHandleMarketplaceSubscriptions()
						? showMarketplaceDialog
						: handleCancelPurchaseClick
				}
				variant="primary"
			>
				{ cancelButtonText }
			</Button>
		);
	};

	const renderKeepSubscriptionButton = () => {
		return (
			<Button
				variant="secondary"
				onClick={ () => {
					navigate( { to: purchaseSettingsRoute.fullPath, params: { purchaseId: purchase.ID } } );
					onKeepSubscriptionClick();
				} }
			>
				{ __( 'Keep plan' ) }
			</Button>
		);
	};

	const renderConfirmCheckbox = () => {
		return (
			<>
				<b>{ __( 'Have a question before cancelling?' ) }</b>
				<p>
					{ createInterpolateElement(
						__( 'Our support team is here for you. <contactLink>Contact us</contactLink>' ),
						{
							contactLink: <a href={ localizeUrl( 'https://wordpress.com/support' ) } />,
						}
					) }
				</p>

				<hr />

				{ isDomainRegistrationPurchase && ! state.surveyShown && (
					<div>
						<CheckboxControl
							label={ __(
								'I understand that canceling means that I may lose this domain forever.'
							) }
							checked={ state.domainConfirmationConfirmed }
							onChange={ onDomainConfirmationChange }
						/>
					</div>
				) }

				<div>
					<CheckboxControl
						label={ __( 'I understand my site will change when my plan expires.' ) }
						onChange={ ( checked ) => {
							if ( atomicTransfer?.created_at ) {
								setState( ( state ) => ( {
									...state,
									customerConfirmedUnderstanding: checked,
								} ) );
								return;
							}

							setState( ( state ) => ( { ...state, customerConfirmedUnderstanding: checked } ) );
						} }
					/>
				</div>
			</>
		);
	};

	const renderProductRevertContent = () => {
		return (
			<>
				{ ! includedDomainPurchase && <p>{ renderFullText() }</p> }

				{ ! state.surveyShown && renderConfirmCheckbox() }

				<ButtonStack>
					{ renderCancelButton() }
					{ renderKeepSubscriptionButton() }
				</ButtonStack>
			</>
		);
	};

	const renderPlanRevertContent = () => {
		return (
			<>
				{ ! includedDomainPurchase && <p>{ renderFullText() }</p> }

				{ renderConfirmCheckbox() }

				<ButtonStack>
					{ renderCancelButton() }
					{ renderKeepSubscriptionButton() }
				</ButtonStack>
			</>
		);
	};

	const renderGSuiteAccessMessage = () => {
		const { meta: domainName, product_slug: productSlug } = purchase;
		if ( ! productSlug || ! selectedDomain ) {
			return;
		}
		const googleMailService = getGoogleMailServiceFamily( productSlug );
		const googleSubscriptionStatus = getGSuiteSubscriptionStatus( selectedDomain );

		if ( [ 'suspended', '' ].includes( googleSubscriptionStatus ) ) {
			return (
				<p>
					{ createInterpolateElement(
						sprintf(
							// Translators: %(domainName) is the name of the domain (e.g. example.com) and %(googleMailService)s can be either "G Suite" or "Google Workspace"
							__(
								'If you cancel your subscription for %(domainName)s now, <strong>you will lose access to all of ' +
									'your %(googleMailService)s features immediately</strong>, and you will ' +
									'need to purchase a new subscription with Google if you wish to regain access to them.'
							),
							{
								domainName,
								googleMailService,
							}
						),
						{
							strong: <strong />,
						}
					) }
				</p>
			);
		}

		return (
			<p>
				{ createInterpolateElement(
					sprintf(
						// Translators: %(domainName) is the name of the domain (e.g. example.com), %(googleMailService)s can be either "G Suite" or "Google Workspace", and %(days)d is a number of days (usually '30')
						__(
							'If you cancel your subscription for %(domainName)s now, <strong>you will lose access to all of ' +
								'your %(googleMailService)s features in %(days)d days</strong>. After that time, ' +
								'you will need to purchase a new subscription with Google if you wish to regain access to them.'
						),
						{
							domainName,
							googleMailService,
							days: 30,
						}
					),
					{
						strong: <strong />,
					}
				) }
			</p>
		);
	};

	const renderMainContent = () => {
		const atomicRevertChanges = [
			{
				getSlug: () => 'primarySite',
				getTitle: () => __( 'Set your site to private.' ),
			},
			{
				getSlug: () => 'primaryDomain',
				getTitle: () =>
					/* translators: %(domainName)s is a domain name */
					sprintf( __( 'Use %(domainName)s as your primary domain' ), {
						domainName: purchase.domain,
					} ),
			},
			{
				getSlug: () => 'removeThemesPluginsData',
				getTitle: () => __( 'Remove your installed themes, plugins, and their data.' ),
			},
			{
				getSlug: () => 'revertThemesAndSettings',
				getTitle: () => __( 'Switch to the settings and theme you had before you upgraded.' ),
			},
		];

		const defaultChanges = [];
		if (
			! isJetpack &&
			! isAkismet &&
			! isDomainRegistrationPurchase &&
			Boolean( atomicTransfer?.created_at )
		) {
			defaultChanges.push( ...atomicRevertChanges );
		}

		// Get features from the API endpoint for this product
		const cancellationFeatures = getFeaturesFromApiForProduct();

		let showDefaultChanges = false;
		if ( ! isJetpack && ! isAkismet && ! isGSuite && ! isDomainRegistrationPurchase ) {
			showDefaultChanges = true;
		}

		const cancellationChanges = showDefaultChanges ? defaultChanges : [];

		// Check if we should show domain options inline (when they don't need radio buttons)
		const shouldShowDomainOptionsInline =
			includedDomainPurchase &&
			! willShowDomainOptionsRadioButtons( includedDomainPurchase, purchase );

		return (
			<>
				{ shouldShowDomainOptionsInline && (
					<CancelPurchaseDomainOptions
						includedDomainPurchase={ includedDomainPurchase }
						cancelBundledDomain={ false }
						purchase={ purchase }
						onCancelConfirmationStateChange={ onCancelConfirmationStateChange }
						isLoading={ false }
					/>
				) }

				{ includedDomainPurchase && atomicTransfer?.created_at && ! purchase.is_refundable && (
					<h2 className="formatted-header__title formatted-header__title--cancellation-flow">
						{ __( 'What happens when you cancel' ) }
					</h2>
				) }

				<BackupRetentionOptionOnCancelPurchase siteId={ purchase.blog_id } purchase={ purchase } />

				{ isGSuite && renderGSuiteAccessMessage() }

				<CancelPurchaseFeatureList
					purchase={ purchase }
					cancellationFeatures={ cancellationFeatures }
					cancellationChanges={ cancellationChanges }
				/>

				<CancelPurchaseRefundInformation purchase={ purchase } isJetpackPurchase={ isJetpack } />

				{ ! cancellationFeatures.length ? renderProductRevertContent() : renderPlanRevertContent() }
			</>
		);
	};

	const renderDomainOptionsContent = () => {
		const { cancelBundledDomain, confirmCancelBundledDomain } = state;

		if ( ! includedDomainPurchase || ! isNonDomainSubscription( purchase ) ) {
			return null;
		}

		const onCancelConfirmationStateChange = ( newState: Partial< CancelPurchaseState > ) => {
			setState( ( state ) => ( {
				...state,
				...newState,
			} ) );
		};

		const canContinue = () => {
			if ( ! cancelBundledDomain ) {
				return true;
			}
			return confirmCancelBundledDomain;
		};

		return (
			<>
				<CancelPurchaseDomainOptions
					includedDomainPurchase={ includedDomainPurchase }
					cancelBundledDomain={ cancelBundledDomain ?? false }
					purchase={ purchase }
					onCancelConfirmationStateChange={ onCancelConfirmationStateChange }
					isLoading={ false }
				/>
				<div className="cancel-purchase__confirm-buttons">
					{ renderCancelButton( { disabled: ! canContinue(), onClick: onSurveyComplete } ) }
					{ renderKeepSubscriptionButton() }
				</div>
			</>
		);
	};

	const getTimeRemainingForSubscription = ( purchase: Purchase ) => {
		const purchaseExpiryDate = new Date( purchase.expiry_date );
		return intervalToDuration( { start: new Date(), end: purchaseExpiryDate } );
	};

	const renderTimeRemainingString = ( purchase: Purchase ) => {
		// returns early if there's no product or accounting for the edge case that the plan expires today (or somehow already expired)
		// in this case, do not show the time remaining for the plan
		const timeRemaining = getTimeRemainingForSubscription( purchase );
		if ( timeRemaining && ( timeRemaining?.days ?? 0 ) <= 1 ) {
			return null;
		}

		// if this product/ plan is partner managed, it won't really "expire" from the user's perspective
		if ( isPartnerPurchase( purchase ) || ! purchase.expiry_date ) {
			return (
				<Notice>
					{ createInterpolateElement(
						sprintf(
							/* translators: %(productName)s is the name of the product */
							__( 'Your <strong> %(productName)s </strong> subscription is still active. <br/>' ),
							{ productName: purchase.product_name }
						),
						{
							strong: <strong />,
							br: <br />,
						}
					) }
				</Notice>
			);
		}

		// show how much time is left on the plan
		return (
			<Notice>
				{ sprintf(
					/* translators: 'timeRemaining' is localized string like "2 months" or "1 year". */
					__( 'Your plan features will be available for another %(timeRemaining)s.' ),
					{
						timeRemaining: formatDistanceToNow( new Date( purchase.expiry_date ) ),
						productName: purchase.product_name,
					}
				) }
			</Notice>
		);
	};

	if ( isHundredYearDomain ) {
		redirect();
		return null;
	}

	const purchaseName = purchase.is_domain ? purchase.meta : purchase.product_name;

	let heading;

	if ( isDomainRegistrationPurchase || isOneTimePurchase( purchase ) ) {
		/* translators: %(purchaseName)s is the name of the product which was purchased */
		heading = sprintf( __( 'Manage %(purchaseName)s' ), {
			purchaseName,
		} );
	}

	if ( isNonDomainSubscription( purchase ) ) {
		heading = __( 'Manage plan' );
	}

	const getHeaderTitle = () => {
		if ( flowType === CANCEL_FLOW_TYPE.REMOVE ) {
			if ( purchase.is_plan ) {
				return __( 'Remove plan' );
			}
			return __( 'Remove product' );
		}

		if ( purchase.is_plan ) {
			return __( 'Cancel plan' );
		}
		return __( 'Cancel product' );
	};

	const planName = purchase.is_domain_registration ? purchase.meta : purchase.product_name;
	let downgradePlan;
	let downgradePlanToPersonalPrice;
	let downgradePlanToMonthlyPrice;
	if ( 'downgrade-monthly' === state.upsell ) {
		downgradePlan = getDowngradePlanForPurchase(
			plans,
			purchase,
			PurchaseDowngradeType.TermDowngrade
		);
		if ( downgradePlan ) {
			downgradePlanToMonthlyPrice = parseFloat( downgradePlan.price );
		}
	} else if ( 'downgrade-personal' === state.upsell ) {
		downgradePlan = getDowngradePlanForPurchase(
			plans,
			purchase,
			PurchaseDowngradeType.PlanDowngrade
		);
		if ( downgradePlan ) {
			downgradePlanToPersonalPrice = parseFloat( downgradePlan.price );
		}
	}
	return (
		<>
			<PageLayout
				size="small"
				header={
					<PageHeader
						title={ getHeaderTitle() }
						prefix={ <Breadcrumbs length={ 2 } /> }
						description={ __(
							'Before you go, please answer a few quick questions to help us improve.'
						) }
					/>
				}
			>
				<VStack>
					{ ! state.surveyShown && renderTimeRemainingString( purchase ) }

					<Card className="cancel-purchase__wrapper-card">
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
							downgradePlanToMonthlyPrice={ downgradePlanToMonthlyPrice }
							downgradePlanToPersonalPrice={ downgradePlanToPersonalPrice }
							flowType={ flowType }
							freeMonthOfferClick={ freeMonthOfferClick }
							getAllSurveySteps={ getAllSurveySteps }
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
							upsell={ state.upsell }
						/>
						{ ! state.surveyShown && (
							<>
								<Heading level={ 4 }>{ heading }</Heading>

								<p className="cancel-purchase__left">
									{ state.showDomainOptionsStep
										? renderDomainOptionsContent()
										: renderMainContent() }
								</p>
							</>
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
					</Card>
				</VStack>
			</PageLayout>
		</>
	);
}
