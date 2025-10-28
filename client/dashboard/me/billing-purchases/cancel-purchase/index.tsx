import {
	DomainProductSlugs,
	FEATURE_PREMIUM_SUPPORT,
	FEATURE_SIMPLE_PAYMENTS,
	FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
	FEATURE_WORDADS_INSTANT,
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
	purchaseQuery,
	siteActiveThemesQuery,
	siteBackupsQuery,
	siteByIdQuery,
	siteEngagementMonthlyAverageStatsQuery,
	sitePluginsQuery,
	sitePricedPlansQuery,
	sitePurchasesQuery,
	siteScanCountsQuery,
	siteScanQuery,
	userPreferencesMutation,
	hasPurchaseBeenExtendedQuery,
} from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { localizeUrl } from '@automattic/i18n-utils';
import { formatCurrency } from '@automattic/number-formatters';
import { useQueryClient, useSuspenseQuery, useQuery, useMutation } from '@tanstack/react-query';
import {
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
	Button,
	Card,
	CheckboxControl,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { intervalToDuration, intlFormat } from 'date-fns';
import { useCallback, useEffect, useRef, useMemo, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import Breadcrumbs from '../../../app/breadcrumbs';
import { useLocale } from '../../../app/locale';
import { cancelPurchaseRoute } from '../../../app/router/me';
import { ButtonStack } from '../../../components/button-stack';
import Notice from '../../../components/notice';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { shuffleArray } from '../../../utils/collection';
import { getGSuiteSubscriptionStatus, getGoogleMailServiceFamily } from '../../../utils/gsuite';
import {
	getDowngradePlanFromPurchase,
	getMonthlyPlanByYearly,
	getPlanFeaturesAndAvailability,
	getPlanFromPlans,
	isCompletePlan,
	isSecurityDailyPlan,
	isSecurityRealTimePlan,
	isWpComMonthlyPlan,
} from '../../../utils/plans';
import {
	CANCEL_FLOW_TYPE,
	getIncludedDomainPurchase,
	getManagePurchaseUrlFor,
	getPurchaseCancellationFlowType,
	hasAmountAvailableToRefund,
	hasMarketplaceProduct,
	isAgencyPartnerType,
	isAkismetProduct,
	isExpired,
	isGSuiteOrGoogleWorkspaceProductSlug,
	isJetpackBackupSlug,
	isJetpackScanSlug,
	isJetpackTemporarySitePurchase,
	isOneTimePurchase,
	isPartnerPurchase,
	isNonDomainSubscription,
	willAtomicSiteRevertAfterPurchaseDeactivation,
} from '../../../utils/purchase';
import {
	getDynamicFeaturesList,
	getGSuiteDynamicFeaturesList,
	getJetpackDynamicFeaturesList,
	planHasFeature,
	productHasAntiSpam,
	productHasBoost,
	productHasScan,
	productHasSearch,
	productHasVideoPress,
} from '../../../utils/site-features';
import { isSiteAutomatedTransfer } from '../../../utils/site-types';
import AtomicRevertChanges from './atomic-revert-changes';
import BackupRetentionOptionOnCancelPurchase from './backup-retention-management/retention-option-on-cancel-purchase';
import CancelPurchaseButton from './button';
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
import nextStep from './next-step';
import CancelPurchaseRefundInformation from './refund-information';
import type { CancelPurchaseState } from './types';
import type { Purchase, Product, MarketingSurveyDetails } from '@automattic/api-core';
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
	const locale = useLocale();
	const [ state, setState ] = useState< CancelPurchaseState >( {
		initialized: false,
	} );
	const { createSuccessNotice, removeNotice, createErrorNotice } = useDispatch( noticesStore );

	const queryClient = useQueryClient();
	const { recordTracksEvent } = useAnalytics();
	const cancelAndRefundPurchaseMutate = useMutation( cancelAndRefundPurchaseMutation() );

	const refreshSitePlans = ( siteId: number ) =>
		queryClient.invalidateQueries( sitePricedPlansQuery( undefined, siteId ) );

	const { purchaseId } = cancelPurchaseRoute.useParams();
	const { data: purchase, isPending: purchaseQueryIsPending } = useSuspenseQuery(
		purchaseQuery( parseInt( purchaseId ) )
	);
	const { data: sitePurchases } = useSuspenseQuery( sitePurchasesQuery( purchase.blog_id ) );
	const { data: products } = useSuspenseQuery( productsQuery() );
	const { data: hasBeenExtended } = useQuery( hasPurchaseBeenExtendedQuery( purchase.blog_id ) );
	const { data: site, isPending: siteQueryIsPending } = useQuery(
		siteByIdQuery( purchase.blog_id )
	);
	const { data: activeThemes, isPending: themesQueryIsPending } = useQuery(
		siteActiveThemesQuery( purchase.blog_id )
	);
	const clearPurchases = () => () =>
		queryClient.invalidateQueries( sitePurchasesQuery( purchase.blog_id ) ); //TODO: test and confirm this works correctly

	const setPurchaseAutoRenewMutation = useMutation( userPurchaseSetAutoRenewQuery( purchase.ID ) );
	const cancelAndRefundMutation = useMutation( cancelAndRefundPurchaseMutation() );
	const extendWithFreeMonthMutation = useMutation( extendPurchaseWithFreeMonthMutation() );

	const { data: activePlugins, isPending: sitePluginsQueryIsPending } = useQuery(
		sitePluginsQuery( purchase.blog_id )
	);
	const pluginCount = ( activePlugins?.plugins ?? [] ).length;

	const { data: monthlyStats, isPending: siteEngagementMonthlyAverageStatsQueryIsPending } =
		useQuery( siteEngagementMonthlyAverageStatsQuery( purchase.blog_id ) );
	let monthlyVisitorCount = 0;
	if ( monthlyStats && monthlyStats.visitors > 0 ) {
		monthlyVisitorCount = monthlyStats.visitors;
	}

	const purchases = purchase && sitePurchases;
	const { data: productsList, isPending: productsQueryIsPending } = useQuery( productsQuery() );
	const { data: selectedDomain, isPending: domainQueryIsPending } = useQuery( {
		...domainQuery( purchase.meta ?? '' ),
		enabled: Boolean( purchase.meta ),
	} );
	const { data: rewindState, isPending: siteBackupsQueryIsPending } = useQuery( {
		...siteBackupsQuery( purchase.blog_id ?? 0 ),
		enabled: Boolean( purchase.blog_id ),
	} );
	const { data: siteScanState, isPending: siteScanQueryIsPending } = useQuery( {
		...siteScanQuery( purchase.blog_id ?? 0 ),
		enabled: Boolean( purchase.blog_id ),
	} );
	const { data: siteThreatCounts, isPending: requestingSiteThreatCounts } = useQuery( {
		...siteScanCountsQuery( purchase.blog_id ?? 0 ),
		enabled: Boolean( purchase.blog_id ),
	} );
	const { data: sitePlans, isPending: sitePlansQueryIsPending } = useQuery( {
		...sitePricedPlansQuery( '', purchase.blog_id ),
	} );
	const { data: plans, isPending: plansQueryIsPending } = useQuery( {
		...plansQuery( '', locale ),
	} );
	const onDialogClose = () => {
		setState( ( state ) => ( {
			...state,
			showDialog: false,
			isLoading: false,
		} ) );
	};

	const includedDomainPurchase = getIncludedDomainPurchase( purchases ?? [], purchase );

	const productSlug = purchase ? purchase.product_slug : null;
	const track = useCallback( () => {
		if ( productSlug ) {
			recordTracksEvent( 'calypso_cancel_purchase_purchase_view', {
				product_slug: productSlug,
			} );
		}
	}, [ productSlug, recordTracksEvent ] );

	const redirect = useCallback( () => {
		let redirectPath = purchasesRoot;

		if (
			site?.slug &&
			purchase &&
			( ! purchase.can_disable_auto_renew ||
				( purchase.product_slug = DomainProductSlugs.TRANSFER_IN ) )
		) {
			redirectPath = ( getManagePurchaseUrlFor ?? managePurchase )( site?.slug, purchase.ID );
		}

		window.location.href = redirectPath;
	}, [ purchase, site?.slug ] );

	// CancelPurchaseButton related
	const closeMarketplaceSubscriptionsDialog = () => {
		setState( ( state ) => ( { ...state, isShowingMarketplaceSubscriptionsDialog: false } ) );
		onDialogClose();
	};

	const showMarketplaceDialog = () => {
		setState( ( state ) => ( { ...state, isShowingMarketplaceSubscriptionsDialog: true } ) );
	};

	// CancelPurchaseForm related
	const userPreferences = useMutation( userPreferencesMutation() );
	const USER_SETTING_KEY = 'calypso_preferences';
	const getCancelPurchaseSurveyCompletedPreferenceKey = ( purchaseId: string | number ): string => {
		return `cancel-purchase-survey-completed-${ purchaseId }`;
	};

	const savePreference = ( key: string | number, value: unknown ) => () => {
		const payload = {
			[ USER_SETTING_KEY ]: {
				[ key ]: value,
			},
		};
		userPreferences.mutate( payload );
	};
	const cancelPurchaseSurveyCompleted = ( purchaseId: number ) => () => {
		savePreference( getCancelPurchaseSurveyCompletedPreferenceKey( purchaseId ), true )();
	};
	const flowType = getPurchaseCancellationFlowType( purchase );

	const shouldProvideCancellationOffer = config.isEnabled( 'cancellation-offers' );

	const {
		mutate: applyCancellationOffer,
		isPending: isApplyingOffer,
		isSuccess: offerApplySuccess,
		error: offerApplyError,
	} = useMutation( applyCancellationOfferMutation( purchase.blog_id, purchase.ID ) );
	const { data: cancellationOffers } = useQuery(
		cancellationOffersQuery( purchase.blog_id, purchase.ID )
	);
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
		} else if ( isDomainRegistration( purchase ) ) {
			steps = [ FEEDBACK_STEP, NEXT_ADVENTURE_STEP ];
		} else if ( ! isGSuiteOrGoogleWorkspace( purchase ) && ! purchase.is_plan ) {
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
			showDialog: false,
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

	const atomicRevertOnClickCheckOne = ( isChecked: boolean ) =>
		setState( ( state ) => ( { ...state, atomicRevertCheckOne: isChecked } ) );

	const atomicRevertOnClickCheckTwo = ( isChecked: boolean ) =>
		setState( ( state ) => ( { ...state, atomicRevertCheckTwo: isChecked } ) );

	const setStateBasedOnExtendedStatus = useCallback( async () => {
		const newState: CancelPurchaseState = {};
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
				is_atomic: isSiteAutomatedTransfer( site ),

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

	const onClickAccept = useCallback( () => {
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

	const downgradeClick = ( upsell: string ) => {
		if ( ! state.isSubmitting ) {
			let downgradePlan = getDowngradePlanFromPurchase( plans, purchase );
			if ( 'downgrade-monthly' === upsell ) {
				const monthlyProductSlug = getMonthlyPlanByYearly( plans, purchase.product_slug );
				downgradePlan = getPlanFromPlans( plans, monthlyProductSlug );
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
						refreshSitePlans( purchase.blog_id );
						clearPurchases();
						createSuccessNotice( response.message, { type: 'snackbar' } );
						window.location.href = purchasesRoot;
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

	const getRefundAmount = () => {
		const { refund_options: refundOptions, currency_code: currencyCode } = purchase;
		// TODO clk numberFormat pass through numberFormat if it stays
		const defaultFormatter = new Intl.NumberFormat( 'en-US', {
			style: 'currency',
			currency: currencyCode,
		} );
		const precision = defaultFormatter.resolvedOptions().maximumFractionDigits;
		const refundAmount =
			isRefundable( purchase ) && refundOptions?.[ 0 ]?.refund_amount
				? refundOptions[ 0 ].refund_amount
				: 0;

		return refundAmount.toFixed( precision );
	};

	const freeMonthOfferClick = async () => {
		if ( ! state.isSubmitting ) {
			setState( ( state ) => ( { ...state, isLoading: true } ) );

			extendWithFreeMonthMutation.mutate( purchase.ID, {
				onSuccess: ( response ) => {
					if ( response.status === 'completed' ) {
						refreshSitePlans( purchase.blog_id );
						clearPurchases();
						createSuccessNotice( response.message, { type: 'snackbar' } );
						window.location.href = purchasesRoot;
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
				getUpsellType( value, {
					productSlug: purchase.product_slug || '',
					canRefund: !! parseFloat( getRefundAmount() ),
					canDowngrade: !! downgradeClick,
					canOfferFreeMonth:
						!! freeMonthOfferClick && ! hasBeenExtended && ! isRefundable( purchase ),
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

	const marketingSurveyMutate = useMutation( marketingSurveyMutation() );
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

	const getActiveMarketplaceSubscriptions = (): Purchase[] => {
		if ( ! purchase.is_plan || ! productsList ) {
			return [];
		}

		const subs =
			purchases?.filter( ( _purchase ) =>
				hasMarketplaceProduct( Object.values( productsList ), _purchase.product_slug )
			) ?? [];
		return subs;
	};

	const handleMarketplaceSubscriptions = ( isPlanRefundable: boolean ) => {
		const cancelAndRefundActiveSubscriptions: Purchase[] = [];
		const cancelActiveSubscriptions: Purchase[] = [];
		const marketplaceSubscriptions = getActiveMarketplaceSubscriptions();
		marketplaceSubscriptions?.forEach( ( subscription ) =>
			isPlanRefundable && hasAmountAvailableToRefund( subscription )
				? cancelAndRefundActiveSubscriptions.push( subscription )
				: cancelActiveSubscriptions.push( subscription )
		);
		if ( cancelAndRefundActiveSubscriptions?.length > 0 ) {
			// FIXME: refund multiple subscriptions
		}

		if ( cancelActiveSubscriptions?.length > 0 ) {
			// FIXME: disable auto-renew for multiple subscriptions
		}
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
		}
		setPurchaseAutoRenewMutation.mutate( false, {
			onSuccess: () => {
				const purchaseName = getName( purchase );
				const subscriptionEndDate = intlFormat(
					purchase.expiry_date,
					{ dateStyle: 'medium' },
					{ locale: 'en-US' }
				);
				const refundable = hasAmountAvailableToRefund( purchase );
				handleMarketplaceSubscriptions( refundable );
				refreshSitePlans( purchase.blog_id );
				clearPurchases();
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
				createErrorNotice(
					sprintf(
						/* translators: %(purchaseName)s is the name of the product that was purchased. */
						__(
							'There was a problem canceling %(purchaseName)s. Please try again later or contact support.'
						),
						{ purchaseName: getName( purchase ) }
					),
					{ type: 'snackbar' }
				);
				setState( ( state ) => ( { ...state, surveyShown: false, isLoading: false } ) );
			},
		} );
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

	const isDataLoading =
		sitePlansQueryIsPending ||
		plansQueryIsPending ||
		siteBackupsQueryIsPending ||
		siteScanQueryIsPending ||
		siteEngagementMonthlyAverageStatsQueryIsPending ||
		siteQueryIsPending ||
		sitePluginsQueryIsPending ||
		purchaseQueryIsPending ||
		themesQueryIsPending ||
		domainQueryIsPending ||
		productsQueryIsPending;

	const isDataValid = useCallback( () => {
		if ( isDataLoading ) {
			return true;
		}

		if ( ! purchase ) {
			return false;
		}

		const isDomainTransferCancelable =
			purchase.is_refundable || ! ( purchase.product_id === DomainProductSlugs.TRANSFER_IN );
		const isValidForCancellation = purchase.can_disable_auto_renew && isDomainTransferCancelable;

		if ( ! isValidForCancellation && state.surveyShown ) {
			return true;
		}

		return isValidForCancellation;
	}, [ isDataLoading, purchase, state.surveyShown ] );

	const didRunEffect = useRef< boolean >( false );

	// componentDidMount
	useEffect( () => {
		if ( didRunEffect.current ) {
			return;
		}
		if ( purchase.ID && isWpComMonthlyPlan( purchase.product_slug ) ) {
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
		purchase.product_slug,
		redirect,
		track,
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
	}, [ isDataValid, state.surveyShown, redirect ] );

	if ( ! isDataValid() ) {
		return null;
	}

	if ( ! state?.initialized && purchase ) {
		initSurveyState();
	}

	if ( isDataLoading ) {
		return <PageLayout size="small" />;
	}

	const currentPlan = sitePlans
		? Object.values( sitePlans ).find( ( plan ) => plan.current_plan )
		: undefined;

	const isJetpack = purchase.is_jetpack_plan_or_product;
	const isAkismet = isAkismetProduct( purchase );
	const isDomainRegistrationPurchase = purchase && isDomainRegistration( purchase );
	const isGSuite = isGSuiteOrGoogleWorkspaceProductSlug( purchase.product_slug );
	const isHundredYearDomain = selectedDomain?.is_hundred_year_domain ?? false;
	const atomicTransfer = getAtomicTransfer( state, purchase.blog_id ); //TODO: update

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

	const getProductBySlug = ( productSlug: string ): Product | undefined => {
		return productsList?.[ productSlug ];
	};

	const onSetLoading = ( isLoading: boolean ) => {
		setState( ( state ) => ( { ...state, isLoading } ) );
	};

	const clickNext = () => {
		changeSurveyStep( nextStep( state.surveyStep ?? '', getAllSurveySteps() ) );
	};

	const closeDialog = () => {
		initSurveyState();
		recordEvent( 'calypso_purchases_cancel_form_close' );
	};

	const onAtomicRevertConfirmationChange = ( isConfirmed: boolean ) => {
		setState( ( state ) => ( { ...state, atomicRevertConfirmed: isConfirmed } ) );
	};

	const onDomainConfirmationChange = ( checked: boolean ) => {
		setState( ( state ) => ( {
			...state,
			domainConfirmationConfirmed: checked,
			customerConfirmedUnderstanding: checked,
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

	const renderCancelButton = () => {
		// Check if we need atomic revert confirmation
		const needsAtomicRevertConfirmation = atomicTransfer?.created_at && ! isRefundable( purchase );

		const isDisabled =
			( state.cancelBundledDomain && ! state.confirmCancelBundledDomain ) ||
			( needsAtomicRevertConfirmation && ! state.atomicRevertConfirmed && purchase.is_plan ) ||
			( isDomainRegistrationPurchase && ! state.domainConfirmationConfirmed ) ||
			! ( state?.customerConfirmedUnderstanding || false );

		return (
			<CancelPurchaseButton
				activeSubscriptions={ getActiveMarketplaceSubscriptions() }
				atomicRevertCheckOne={ state.atomicRevertCheckOne }
				atomicRevertCheckTwo={ state.atomicRevertCheckTwo }
				atomicRevertOnClickCheckOne={ atomicRevertOnClickCheckOne }
				atomicRevertOnClickCheckTwo={ atomicRevertOnClickCheckTwo }
				cancelBundledDomain={ state.cancelBundledDomain ?? false }
				clickNext={ clickNext }
				closeDialog={ closeDialog }
				closeMarketplaceSubscriptionsDialog={ closeMarketplaceSubscriptionsDialog }
				currentPlan={ currentPlan }
				disabled={ isDisabled }
				downgradeClick={ downgradeClick }
				freeMonthOfferClick={ freeMonthOfferClick }
				getAllSurveySteps={ getAllSurveySteps }
				importQuestionRadio={ state.importQuestionRadio }
				includedDomainPurchase={ includedDomainPurchase }
				isAkismet={ isAkismet }
				isJetpack={ isJetpack }
				isLoading={ state.isLoading ?? false }
				isNextAdventureValid={ state.isNextAdventureValid }
				isShowingMarketplaceSubscriptionsDialog={ state.isShowingMarketplaceSubscriptionsDialog }
				isSubmitting={ state.isSubmitting }
				offerDiscountBasedFromPurchasePrice={ offerDiscountBasedFromPurchasePrice }
				onCancellationComplete={ onCancellationComplete }
				onCancellationStart={ onCancellationStart }
				onClickAccept={ onClickAccept }
				onDialogClose={ onDialogClose }
				onImportRadioChange={ onImportRadioChange }
				onNextAdventureValidationChange={ onNextAdventureValidationChange }
				onRadioOneChange={ onRadioOneChange }
				onRadioTwoChange={ onRadioTwoChange }
				onSetLoading={ onSetLoading }
				onSubmit={ onSubmit }
				onSurveyComplete={ onSurveyComplete }
				onTextOneChange={ onTextOneChange }
				onTextThreeChange={ onTextThreeChange }
				onTextTwoChange={ onTextTwoChange }
				plans={ plans }
				purchase={ purchase }
				purchases={ purchases }
				purchaseListUrl={ purchasesRoot }
				questionOneRadio={ state.questionOneRadio }
				questionOneText={ state.questionOneText }
				questionTwoOrder={ state.questionTwoOrder }
				questionTwoRadio={ state.questionTwoRadio }
				questionTwoText={ state.questionTwoText }
				refundAmount={ getRefundAmount() }
				showDialog={ state.showDialog }
				showMarketplaceDialog={ showMarketplaceDialog }
				site={ site }
				sitePlans={ sitePlans }
				sitePurchases={ sitePurchases }
				siteSlug={ site?.slug }
				solution={ state.solution }
				surveyStep={ state.surveyStep }
				upsell={ state.upsell }
			/>
		);
	};

	const renderKeepSubscriptionButton = () => {
		return (
			<Button
				variant="secondary"
				href={ ( props.getManagePurchaseUrlFor ?? managePurchase )(
					site?.slug ?? '',
					purchase.ID ?? ''
				) }
				onClick={ onKeepSubscriptionClick }
			>
				{ __( 'Keep plan' ) }
			</Button>
		);
	};

	const renderProductRevertContent = () => {
		return (
			<Card className="cancel-purchase__footer">
				{ isDomainRegistrationPurchase && ! state.surveyShown && (
					<div className="cancel-purchase__domain-confirmation">
						<CheckboxControl
							checked={ state.domainConfirmationConfirmed }
							onChange={ onDomainConfirmationChange }
						/>
						<span>
							{ createInterpolateElement(
								__(
									'I understand that canceling means that I may <strong>lose this domain forever</strong>.'
								),
								{
									strong: <strong />,
								}
							) }
						</span>
					</div>
				) }
				<div className="cancel-purchase__footer-text-wrapper">{ renderCancelButton() }</div>
			</Card>
		);
	};

	const renderPlanRevertContent = () => {
		return (
			<>
				<AtomicRevertChanges
					atomicTransfer={ atomicTransfer }
					purchase={ purchase }
					onConfirmationChange={ onAtomicRevertConfirmationChange }
					needsAtomicRevertConfirmation={ Boolean(
						atomicTransfer?.created_at && ! isRefundable( purchase )
					) }
					isLoading={ state.isLoading }
				/>

				{ ! includedDomainPurchase && <p>{ renderFullText() }</p> }

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

				<div>
					<CheckboxControl
						label={ __( 'I understand my site will change when my plan expires.' ) }
						// checked={ atomicRevertCheckOne }
						onChange={ ( checked ) => {
							setState( ( state ) => ( { ...state, customerConfirmedUnderstanding: checked } ) );
						} }
					/>
				</div>

				<ButtonStack>
					{ renderCancelButton() }
					{ renderKeepSubscriptionButton() }
				</ButtonStack>
			</>
		);
	};

	// const mediaQueryOptions = { mime_type: 'video/videopress', number: 1 }; // we only want the total count, no actual media items returned. Set to 1 to keep response size small (0 is not a valid value).
	// const mediaFound = useSelector( ( state ) =>
	// 	getMediaFound( state, String( props.siteId ), mediaQueryOptions )
	// );
	// const { data: mediaStorageInfo } = useSuspenseQuery( siteMediaStorageQuery( props.siteId ) );
	//TODO: use the correct query
	const siteMediaCount = 0;

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
		const plan = getPlanFeaturesAndAvailability( purchase.product_slug );
		const defaultWPComChanges = [
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
		if ( ! isJetpack && ! isAkismet && ! isDomainRegistrationPurchase ) {
			defaultChanges.push( ...defaultWPComChanges );
		}

		const defaultGSuiteCancellationFeatures = getGSuiteDynamicFeaturesList( {
			domainName: site?.slug ?? '',
			productSlug: purchase.product_slug,
		} );

		const defaultWPComCancellationFeatures = getDynamicFeaturesList( {
			domainName: site?.slug,
			themeName: activeThemes?.[ 0 ]?.name?.rendered,
			pluginCount,
			monthlyVisitorCount,
		} );
		const siteHasBackups = 'unavailable' !== rewindState?.state;
		const siteHasScan = 'unavailable' !== siteScanState?.state;
		const defaultJetpackCancellationFeatures = getJetpackDynamicFeaturesList( {
			site,
			hasPremiumSupport: planHasFeature( purchase.product_slug, FEATURE_PREMIUM_SUPPORT ),
			hasSimplePayments: planHasFeature( purchase.product_slug, FEATURE_SIMPLE_PAYMENTS ),
			hasWordAdsInstant: planHasFeature( purchase.product_slug, FEATURE_WORDADS_INSTANT ),
			hasBackups: siteHasBackups,
			backupsIsStandalone: isJetpackBackupSlug( purchase.product_slug ),
			backups: rewindState,
			hasSearch: productHasSearch( purchase.product_slug ),
			hasBoost: productHasBoost( purchase.product_slug ),
			hasAntiSpam: productHasAntiSpam( purchase.product_slug ),
			hasScan: siteHasScan && productHasScan( purchase.product_slug ),
			siteScanState,
			siteThreatCounts,
			requestingSiteThreatCounts,
			siteScanIsStandalone: isJetpackScanSlug( purchase.product_slug ),
			hasYearActivityLog:
				isCompletePlan( purchase.product_slug ) || isSecurityRealTimePlan( purchase.product_slug ),
			hasMonthActivityLog: isSecurityDailyPlan( purchase.product_slug ),
			hasVideoPress: productHasVideoPress( purchase.product_slug ),
			hasVideoUploadsJetpackPro: planHasFeature(
				purchase.product_slug,
				FEATURE_VIDEO_UPLOADS_JETPACK_PRO
			),
			siteMediaCount,
		} );

		const defaultCancellationFeatures = [];
		let showDefaultChanges = false;
		if ( isJetpack || isAkismet ) {
			defaultCancellationFeatures.push( ...defaultJetpackCancellationFeatures );
		} else if ( isGSuite ) {
			defaultCancellationFeatures.push( ...defaultGSuiteCancellationFeatures );
		} else if ( isDomainRegistrationPurchase ) {
			// defaultCancellationFeatures.push( ...de)
		} else {
			defaultCancellationFeatures.push( ...defaultWPComCancellationFeatures );
			showDefaultChanges = true;
		}

		const cancellationFeatures =
			plan && 'getCancellationFeatures' in plan ? plan.getCancellationFeatures?.() ?? [] : [];

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

				{ includedDomainPurchase && atomicTransfer?.created_at && ! isRefundable( purchase ) && (
					<h2 className="formatted-header__title formatted-header__title--cancellation-flow">
						{ __( 'What happens when you cancel' ) }
					</h2>
				) }

				<BackupRetentionOptionOnCancelPurchase siteId={ purchase.blog_id } purchase={ purchase } />

				{ isGSuite && renderGSuiteAccessMessage() }

				<CancelPurchaseFeatureList
					purchase={ purchase }
					defaultCancellationFeatures={ defaultCancellationFeatures }
					cancellationFeatures={ cancellationFeatures }
					cancellationChanges={ cancellationChanges }
				/>

				<CancelPurchaseRefundInformation purchase={ purchase } isJetpackPurchase={ isJetpack } />

				{ ! cancellationFeatures.length && ! defaultCancellationFeatures.length
					? renderProductRevertContent()
					: renderPlanRevertContent() }
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
					<CancelPurchaseButton
						activeSubscriptions={ getActiveMarketplaceSubscriptions() }
						atomicRevertCheckOne={ state.atomicRevertCheckOne }
						atomicRevertCheckTwo={ state.atomicRevertCheckTwo }
						atomicRevertOnClickCheckOne={ atomicRevertOnClickCheckOne }
						atomicRevertOnClickCheckTwo={ atomicRevertOnClickCheckTwo }
						cancelBundledDomain={ cancelBundledDomain }
						clickNext={ clickNext }
						closeDialog={ closeDialog }
						closeMarketplaceSubscriptionsDialog={ closeMarketplaceSubscriptionsDialog }
						currentPlan={ currentPlan }
						disabled={ ! canContinue() }
						downgradeClick={ downgradeClick }
						freeMonthOfferClick={ freeMonthOfferClick }
						getAllSurveySteps={ getAllSurveySteps }
						importQuestionRadio={ state.importQuestionRadio }
						includedDomainPurchase={ includedDomainPurchase }
						isAkismet={ isAkismet }
						isJetpack={ isJetpack }
						isLoading={ state.isLoading }
						isNextAdventureValid={ state.isNextAdventureValid }
						isShowingMarketplaceSubscriptionsDialog={
							state.isShowingMarketplaceSubscriptionsDialog
						}
						isSubmitting={ state.isSubmitting }
						offerDiscountBasedFromPurchasePrice={ offerDiscountBasedFromPurchasePrice }
						onCancellationComplete={ onCancellationComplete }
						onCancellationStart={ null }
						onClickAccept={ onClickAccept }
						onDialogClose={ onDialogClose }
						onImportRadioChange={ onImportRadioChange }
						onNextAdventureValidationChange={ onNextAdventureValidationChange }
						onRadioOneChange={ onRadioOneChange }
						onRadioTwoChange={ onRadioTwoChange }
						onSetLoading={ onSetLoading }
						onSubmit={ onSubmit }
						onSurveyComplete={ onSurveyComplete }
						onTextOneChange={ onTextOneChange }
						onTextThreeChange={ onTextThreeChange }
						onTextTwoChange={ onTextTwoChange }
						plans={ plans }
						purchase={ purchase }
						purchases={ purchases }
						purchaseListUrl={ purchasesRoot }
						questionOneRadio={ state.questionOneRadio }
						questionOneText={ state.questionOneText }
						questionTwoOrder={ state.questionTwoOrder }
						questionTwoRadio={ state.questionTwoRadio }
						questionTwoText={ state.questionTwoText }
						refundAmount={ getRefundAmount() }
						shouldShowMarketplaceDialog={ false } // Disable marketplace dialog in domain options step to prevent double display
						showDialog={ state.showDialog }
						showMarketplaceDialog={ showMarketplaceDialog }
						site={ site }
						sitePlans={ sitePlans }
						sitePurchases={ sitePurchases }
						siteSlug={ site?.slug }
						solution={ state.solution }
						surveyStep={ state.surveyStep }
						upsell={ state.upsell }
					/>
					{ renderKeepSubscriptionButton() }
				</div>
			</>
		);
	};

	const getTimeRemainingForSubscription = ( purchase: Purchase ) => {
		const purchaseExpiryDate = new Date( purchase.expiry_date );

		return intervalToDuration( { start: new Date(), end: purchaseExpiryDate } );
	};

	const getTimeRemainingTranslatedPeriod = ( purchase: Purchase ) => {
		const timeRemaining = getTimeRemainingForSubscription( purchase );

		if ( timeRemaining.months >= 1 ) {
			const timeRemainingNumber = timeRemaining.months;
			const unitOfTime = _n( 'month', 'months', timeRemainingNumber );

			return { timeRemainingNumber, unitOfTime };
		} else if ( timeRemaining.weeks > 1 ) {
			const timeRemainingNumber = timeRemaining.weeks;
			const unitOfTime = _n( 'week', 'weeks', timeRemainingNumber );

			return { timeRemainingNumber, unitOfTime };
		}

		const timeRemainingNumber = timeRemaining.days;
		const unitOfTime = _n( 'day', 'days', timeRemainingNumber );

		return { timeRemainingNumber, unitOfTime };
	};

	const renderTimeRemainingString = ( purchase: Purchase ) => {
		const product = getProductBySlug( purchase.product_slug );
		// returns early if there's no product or accounting for the edge case that the plan expires today (or somehow already expired)
		// in this case, do not show the time remaining for the plan
		const timeRemaining = getTimeRemainingForSubscription( purchase );
		if ( null === product || timeRemaining.days <= 1 ) {
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
							{ productName: product?.product_name }
						),
						{
							strong: <strong />,
							br: <br />,
						}
					) }
				</Notice>
			);
		}

		const translatedPeriod = getTimeRemainingTranslatedPeriod( purchase );

		// show how much time is left on the plan
		return (
			<Notice>
				{ sprintf(
					/* translators: 'unitOfTime' is either one of 'day', 'week', 'month', or their plural form. 'timeRemaining' is a number representing the time left that will be used with the 'unitOfTime'. */
					__(
						'Your plan features will be available for another %(timeRemaining)d %(unitOfTime)s.'
					),
					{
						timeRemaining: translatedPeriod.timeRemainingNumber,
						unitOfTime: translatedPeriod.unitOfTime,
						productName: product?.product_name,
					}
				) }
			</Notice>
		);
	};

	if ( isHundredYearDomain ) {
		redirect();
		return null;
	}

	if ( ! purchase ) {
		return null;
	}

	const purchaseName = getName( purchase );

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
							cancelBundledDomain={ state.cancelBundledDomain }
							cancellationInProgress={ state.isLoading }
							clickNext={ clickNext }
							closeDialog={ closeDialog }
							currentPlan={ currentPlan }
							disableButtons={ state.isLoading }
							downgradeClick={ downgradeClick }
							flowType={ flowType }
							freeMonthOfferClick={ freeMonthOfferClick }
							getAllSurveySteps={ getAllSurveySteps }
							importQuestionRadio={ state.importQuestionRadio }
							includedDomainPurchase={ includedDomainPurchase }
							isNextAdventureValid={ state.isNextAdventureValid }
							isShowing={ state.isShowingMarketplaceSubscriptionsDialog }
							isSubmitting={ state.isSubmitting }
							isVisible={ state.surveyShown }
							offerDiscountBasedFromPurchasePrice={ offerDiscountBasedFromPurchasePrice }
							onClose={ () => setState( ( state ) => ( { ...state, surveyShown: false } ) ) }
							onClickAccept={ onClickAccept }
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
							products={ Object.values( products ) }
							questionOneOrder={ state.questionOneOrder }
							questionOneRadio={ state.questionOneRadio }
							questionOneText={ state.questionOneText }
							questionTwoOrder={ state.questionTwoOrder }
							questionTwoRadio={ state.questionTwoRadio }
							questionTwoText={ state.questionTwoText }
							refundAmount={ getRefundAmount() }
							site={ site }
							sitePlans={ sitePlans }
							sitePurchases={ sitePurchases }
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
					</Card>
				</VStack>
			</PageLayout>
		</>
	);
}
