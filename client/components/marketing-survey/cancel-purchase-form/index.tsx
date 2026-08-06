import {
	isGSuiteOrGoogleWorkspace,
	isPlan,
	isWpComMonthlyPlan,
	WPCOM_FEATURES_BACKUPS,
	isDomainRegistration,
} from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { shuffle } from '@automattic/js-utils';
import { Button as GutenbergButton, Spinner } from '@wordpress/components';
import { localize, LocalizeProps } from 'i18n-calypso';
import moment from 'moment';
import { Component } from 'react';
import { connect } from 'react-redux';
import { BlankCanvas } from 'calypso/components/blank-canvas';
import QueryProducts from 'calypso/components/data/query-products-list';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import FormattedHeader from 'calypso/components/formatted-header';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { getSolutionsForReason } from 'calypso/dashboard/me/billing-purchases/cancel-purchase/get-solutions-for-reason';
import { useIsSplitCancelRemoveEnabled } from 'calypso/dashboard/me/billing-purchases/cancel-purchase/use-is-split-cancel-remove-enabled';
import {
	isAgencyPartnerType,
	isExpiredOrRemoved,
	hasAmountAvailableToRefund,
	isOneTimePurchase,
	isPartnerPurchase,
} from 'calypso/dashboard/utils/purchase';
import { cancelPurchaseSurveyCompleted, submitSurvey } from 'calypso/lib/purchases/actions';
import wpcom from 'calypso/lib/wp';
import { isSubscription } from 'calypso/me/purchases/lib/raw-purchase-helpers';
import useCheckPlanAvailabilityForPurchase from 'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { fetchAtomicTransfer } from 'calypso/state/atomic-transfer/actions';
import {
	willAtomicSiteRevertAfterPurchaseDeactivation,
	getDowngradePlanFromPurchase,
	getDowngradePlanToMonthlyFromPurchase,
} from 'calypso/state/purchases/selectors';
import getAtomicTransfer from 'calypso/state/selectors/get-atomic-transfer';
import getSiteImportEngine from 'calypso/state/selectors/get-site-import-engine';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import getSite from 'calypso/state/sites/selectors/get-site';
import { CANCEL_FLOW_TYPE } from './constants';
import enrichedSurveyData from './enriched-survey-data';
import { getUpsellType } from './get-upsell-type';
import initialSurveyState from './initial-survey-state';
import nextStep from './next-step';
import {
	cancellationOptionsForPurchase,
	nextAdventureOptionsForPurchase,
} from './options-for-product';
import PrecancellationChatButton from './precancellation-chat-button';
import { AtomicRevertStep } from './step-components/atomic-revert-step';
import EducationContentStep from './step-components/educational-content-step';
import FeedbackStep from './step-components/feedback-step';
import NextAdventureStep from './step-components/next-adventure-step';
import SolutionsCardsUpsellStep from './step-components/solutions-cards-upsell-step';
import UpsellStep from './step-components/upsell-step';
import {
	ATOMIC_REVERT_STEP,
	FEEDBACK_STEP,
	UPSELL_STEP,
	NEXT_ADVENTURE_STEP,
	REMOVE_PLAN_STEP,
} from './steps';
import type { UpsellType } from './get-upsell-type';
import type { Purchase } from '@automattic/api-core';
import type { PlanSlug } from '@automattic/calypso-products';
import type { SiteDetails } from '@automattic/data-stores';
import type { DisplayVariant } from 'calypso/lib/purchases/utils';
import type { IAppState } from 'calypso/state/types';
import type { ReactNode } from 'react';

import './style.scss';

type UpsellState = UpsellType | 'solutions-cards';

type EventOrValue = string | { currentTarget?: { value?: string } };

function getEventValue( eventOrValue: EventOrValue ): string {
	if ( typeof eventOrValue === 'string' ) {
		return eventOrValue;
	}
	return eventOrValue?.currentTarget?.value ?? '';
}

interface MomentProps {
	moment: typeof moment;
}

export interface CancelPurchaseFormOwnProps {
	disableButtons?: boolean;
	purchase: Purchase;
	isVisible?: boolean;
	onClose: () => void;
	onSurveyComplete?: () => void;
	flowType: string;
	cancelBundledDomain?: boolean;
	includedDomainPurchase?: object;
	linkedPurchases?: Purchase[];
	skipRemovePlanSurvey?: boolean;
	cancellationInProgress?: boolean;
	intent?: DisplayVariant | null;
	purchaseSettingsUrl?: string;
	isSplitCancelRemoveEnabled?: boolean;
	downgradeClick?: ( upsell: string ) => void;
	freeMonthOfferClick?: () => void;
	onSwitchToMonthly?: () => void;
	downgradePlanToPersonalPrice?: number | null;
	downgradePlanToMonthlyPrice?: number | null;
}

interface CancelPurchaseFormConnectedProps {
	isAtomicSite?: boolean | null;
	isImport?: boolean;
	site: SiteDetails | null;
	willAtomicSiteRevert?: boolean;
	atomicTransfer?: { created_at?: string };
	hasBackupsFeature?: boolean;
	cancelPurchaseSurveyCompleted: ( purchaseId: number | string ) => void;
	fetchAtomicTransfer: ( siteId: number ) => void;
	recordTracksEvent: ( name: string, properties?: Record< string, unknown > ) => void;
	submitSurvey: (
		surveyName: string,
		siteId: number,
		surveyData: Record< string, unknown >
	) => Promise< void >;
}

type CancelPurchaseFormProps = CancelPurchaseFormOwnProps &
	CancelPurchaseFormConnectedProps &
	LocalizeProps &
	MomentProps;

interface CancelPurchaseFormState {
	surveyStep?: string;
	questionOneText: string;
	questionOneOrder: string[];
	questionOneRadio?: string;
	questionOneDetails?: string;
	questionTwoText: string;
	questionTwoOrder: string[];
	questionTwoRadio?: string;
	questionThreeText: string;
	importQuestionRadio?: string;
	isSubmitting: boolean;
	solution: string;
	upsell: UpsellState;
	atomicRevertCheckOne: boolean;
	atomicRevertCheckTwo: boolean;
	purchaseIsAlreadyExtended: boolean;
	isNextAdventureValid: boolean;
}

class CancelPurchaseForm extends Component< CancelPurchaseFormProps, CancelPurchaseFormState > {
	static defaultProps = {
		isVisible: false,
	};

	getAllSurveySteps() {
		const {
			purchase,
			skipRemovePlanSurvey,
			willAtomicSiteRevert,
			flowType,
			isSplitCancelRemoveEnabled,
		} = this.props;
		let steps = [ FEEDBACK_STEP ];

		if (
			skipRemovePlanSurvey ||
			( isPartnerPurchase( purchase ) && isAgencyPartnerType( purchase.partner_type ?? '' ) )
		) {
			steps = [];
		} else if ( ! isPlan( purchase ) ) {
			steps = [ NEXT_ADVENTURE_STEP ];
		} else if ( this.state.upsell ) {
			steps = [ FEEDBACK_STEP, UPSELL_STEP, NEXT_ADVENTURE_STEP ];
		} else if ( this.state.questionTwoOrder.length ) {
			steps = [ FEEDBACK_STEP, NEXT_ADVENTURE_STEP ];
		}

		if (
			willAtomicSiteRevert &&
			flowType === CANCEL_FLOW_TYPE.REMOVE &&
			! isSplitCancelRemoveEnabled
		) {
			steps.push( ATOMIC_REVERT_STEP );
		}

		if ( skipRemovePlanSurvey && steps.length === 0 ) {
			steps.push( REMOVE_PLAN_STEP );
		}

		return steps;
	}

	initSurveyState() {
		const [ firstStep ] = this.getAllSurveySteps();

		this.setState( {
			surveyStep: firstStep,
			...initialSurveyState(),
			upsell: '',
		} );
	}

	constructor( props: CancelPurchaseFormProps ) {
		super( props );

		const { purchase } = props;
		const questionOneOrder = shuffle( cancellationOptionsForPurchase( purchase ) );
		const questionTwoOrder = shuffle( nextAdventureOptionsForPurchase( purchase ) );

		questionOneOrder.push( 'anotherReasonOne' );

		if ( questionTwoOrder.length > 0 ) {
			questionTwoOrder.push( 'anotherReasonTwo' );
		}

		this.state = {
			questionOneText: '',
			questionOneOrder,
			questionTwoText: '',
			questionTwoOrder,
			questionThreeText: '',
			isSubmitting: false,
			solution: '',
			upsell: '',
			atomicRevertCheckOne: false,
			atomicRevertCheckTwo: false,
			purchaseIsAlreadyExtended: false,
			isNextAdventureValid: true,
		};
	}

	recordEvent = ( name: string, properties: Record< string, unknown > = {} ) => {
		const { purchase, flowType, isAtomicSite } = this.props;

		this.props.recordTracksEvent( name, {
			cancellation_flow: flowType,
			product_slug: purchase.product_slug,
			is_atomic: isAtomicSite,

			...properties,
		} );
	};

	recordClickRadioEvent = ( option: string, value: string ) =>
		this.props.recordTracksEvent( 'calypso_purchases_cancel_form_select_radio_option', {
			option,
			value,
		} );

	onRadioOneChange = ( eventOrValue: EventOrValue ) => {
		const value = getEventValue( eventOrValue );
		this.recordClickRadioEvent( 'radio_1', value );

		this.setState( {
			questionOneRadio: value,
			questionOneText: '',
			upsell: '',
		} );
	};

	onTextOneChange = ( eventOrValue: EventOrValue, detailsValue?: string ) => {
		const { downgradeClick, freeMonthOfferClick, purchase } = this.props;
		const value = getEventValue( eventOrValue );
		const { purchaseIsAlreadyExtended, questionOneDetails } = this.state;

		// Only fire the tracking event if this is a dropdown selection (detailsValue is undefined)
		if ( detailsValue === undefined && value && value !== '' ) {
			this.recordClickRadioEvent( 'radio_1_2', value );
		}

		const upsellFromType = getUpsellType( value, {
			productSlug: purchase?.product_slug || '',
			canRefund: !! parseFloat( this.getRefundAmount() ),
			canDowngrade: !! downgradeClick,
			canOfferFreeMonth:
				!! freeMonthOfferClick && ! purchaseIsAlreadyExtended && ! purchase.is_refundable,
		} );
		const hasSolutionsCards =
			this.props.isSplitCancelRemoveEnabled && ( getSolutionsForReason( value )?.length ?? 0 ) > 0;
		this.setState( {
			questionOneText: value,
			questionOneDetails: detailsValue || questionOneDetails,
			upsell: upsellFromType || ( hasSolutionsCards ? 'solutions-cards' : '' ),
		} );
	};

	onRadioTwoChange = ( eventOrValue: EventOrValue ) => {
		const value = getEventValue( eventOrValue );
		this.recordClickRadioEvent( 'radio_2', value );

		this.setState( {
			questionTwoRadio: value,
			questionTwoText: '',
		} );
	};

	onTextTwoChange = ( eventOrValue: EventOrValue ) => {
		const value = getEventValue( eventOrValue );
		this.setState( {
			questionTwoText: value,
		} );
	};

	onTextThreeChange = ( eventOrValue: EventOrValue ) => {
		const value = getEventValue( eventOrValue );
		this.setState( {
			questionThreeText: value,
		} );
	};

	onImportRadioChange = ( eventOrValue: EventOrValue ) => {
		const value = getEventValue( eventOrValue );
		this.recordClickRadioEvent( 'import_radio', value );

		this.setState( {
			importQuestionRadio: value,
		} );
	};

	onNextAdventureValidationChange = ( isValid: boolean ) => {
		this.setState( { isNextAdventureValid: isValid } );
	};

	// Because of the legacy reason, we can't just use `flowType` here.
	// Instead we have to map it to the data keys defined way before `flowType` is introduced.
	getSurveyDataType = () => {
		switch ( this.props.flowType ) {
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

	onSubmit = () => {
		const { purchase } = this.props;

		if ( ! isGSuiteOrGoogleWorkspace( purchase ) ) {
			this.setState( {
				solution: '',
				isSubmitting: true,
			} );

			const hasSubOption = this.state.questionOneDetails && this.state.questionOneText;
			const responseValue = hasSubOption
				? this.state.questionOneDetails
				: this.state.questionOneRadio;

			const surveyData = {
				'why-cancel': {
					response: responseValue,
					text: this.state.questionOneText,
				},
				'next-adventure': {
					response: this.state.questionTwoRadio,
					text: this.state.questionTwoText,
				},
				'what-better': { text: this.state.questionThreeText },
				'import-satisfaction': { response: this.state.importQuestionRadio },
				type: this.getSurveyDataType(),
			};

			this.props
				.submitSurvey(
					'calypso-remove-purchase',
					purchase.blog_id,
					enrichedSurveyData( surveyData, {
						subscribedDate: purchase.subscribed_date,
						blogCreatedDate: purchase.blog_created_date,
						id: purchase.ID,
						productSlug: purchase.product_slug,
					} )
				)
				.then( () => {
					this.setState( {
						isSubmitting: false,
					} );
				} );

			if ( this.props.flowType === CANCEL_FLOW_TYPE.CANCEL_AUTORENEW ) {
				this.props.cancelPurchaseSurveyCompleted( purchase.ID );
			}
		}

		if ( this.props.onSurveyComplete ) {
			this.props.onSurveyComplete();
		}

		this.recordEvent( 'calypso_purchases_cancel_form_submit' );
	};

	downgradeClick = ( upsell: string ) => {
		if ( ! this.state.isSubmitting ) {
			this.props.downgradeClick?.( upsell );
			this.recordEvent( 'calypso_purchases_downgrade_form_submit' );
			this.setState( {
				solution: 'downgrade',
				isSubmitting: true,
			} );
		}
	};

	freeMonthOfferClick = () => {
		if ( ! this.state.isSubmitting ) {
			this.props.freeMonthOfferClick?.();
			this.recordEvent( 'calypso_purchases_free_month_offer_form_submit' );
			this.setState( {
				solution: 'free-month-offer',
				isSubmitting: true,
			} );
		}
	};

	getRefundAmount = () => {
		const { purchase } = this.props;
		const { refund_options: refundOptions, currency_code: currencyCode } = purchase;
		// TODO clk numberFormat pass through numberFormat if it stays
		const defaultFormatter = new Intl.NumberFormat( 'en-US', {
			style: 'currency',
			currency: currencyCode,
		} );
		const precision = defaultFormatter.resolvedOptions().maximumFractionDigits;
		const refundAmount =
			purchase.is_refundable && refundOptions?.[ 0 ]?.refund_amount
				? refundOptions[ 0 ].refund_amount
				: 0;

		return parseFloat( String( refundAmount ) ).toFixed( precision );
	};

	surveyContent(): ReactNode {
		const {
			atomicTransfer,
			translate,
			isImport,
			moment,
			purchase,
			site,
			hasBackupsFeature,
			flowType,
		} = this.props;
		const intent = this.props.intent ?? undefined;
		const { atomicRevertCheckOne, atomicRevertCheckTwo, surveyStep, upsell } = this.state;
		const { product_name: productName } = purchase;

		if ( surveyStep === FEEDBACK_STEP ) {
			return (
				<FeedbackStep
					purchase={ purchase }
					isImport={ Boolean( isImport ) }
					cancellationReasonCodes={ this.state.questionOneOrder }
					onChangeCancellationReason={ this.onRadioOneChange }
					onChangeCancellationReasonDetails={ this.onTextOneChange }
					onChangeImportFeedback={ this.onImportRadioChange }
					intent={ intent }
				/>
			);
		}

		if ( surveyStep === UPSELL_STEP ) {
			const allSteps = this.getAllSurveySteps();
			const isLastStep = surveyStep === allSteps[ allSteps.length - 1 ];

			const solutions = getSolutionsForReason( this.state.questionOneText || '' );
			const useSolutionsCards =
				this.props.isSplitCancelRemoveEnabled && solutions && solutions.length > 0;

			// When flag is on and we have solution cards for this reason, show them
			// instead of the legacy education or single-upsell step.
			if ( useSolutionsCards ) {
				return (
					<SolutionsCardsUpsellStep
						cancellationReason={ this.state.questionOneText }
						cancellationInProgress={ this.props.cancellationInProgress }
						cancelBundledDomain={ this.props.cancelBundledDomain }
						closeDialog={ this.closeDialog }
						downgradePlanPrice={ this.props.downgradePlanToMonthlyPrice }
						includedDomainPurchase={ this.props.includedDomainPurchase }
						intent={ intent }
						onClickDowngrade={ this.downgradeClick }
						onDeclineUpsell={ isLastStep ? this.onSubmit : this.clickNext }
						onSwitchToMonthly={ this.props.onSwitchToMonthly }
						purchase={ purchase }
						purchaseSettingsUrl={ this.props.purchaseSettingsUrl }
						recordEvent={ this.recordEvent }
						refundAmount={ this.getRefundAmount() }
						site={ site as SiteDetails }
					/>
				);
			}

			if ( upsell.startsWith( 'education:' ) ) {
				return (
					<EducationContentStep
						type={ upsell as UpsellType }
						site={ site as SiteDetails }
						onDecline={ isLastStep ? this.onSubmit : this.clickNext }
						cancellationReason={ this.state.questionOneText }
					/>
				);
			}

			return (
				<UpsellStep
					upsell={ this.state.upsell as UpsellType }
					cancellationReason={ this.state.questionOneText }
					purchase={ purchase }
					site={ site as SiteDetails }
					refundAmount={ this.getRefundAmount() }
					intent={ intent }
					declineButtonText={
						intent === 'remove' ? translate( 'Continue removal' ) : translate( 'No, thanks' )
					}
					downgradePlanPrice={
						'downgrade-personal' === this.state.upsell
							? this.props.downgradePlanToPersonalPrice
							: this.props.downgradePlanToMonthlyPrice
					}
					closeDialog={ this.closeDialog }
					cancelBundledDomain={ this.props.cancelBundledDomain }
					includedDomainPurchase={ this.props.includedDomainPurchase }
					onDeclineUpsell={ isLastStep ? this.onSubmit : this.clickNext }
					onClickDowngrade={ this.downgradeClick }
					onClickFreeMonthOffer={ this.freeMonthOfferClick }
				/>
			);
		}

		if ( surveyStep === NEXT_ADVENTURE_STEP ) {
			const allSteps = this.getAllSurveySteps();
			return (
				<NextAdventureStep
					isPlan={ isPlan( purchase ) }
					isOnlyStep={ allSteps.length === 1 }
					intent={ intent }
					adventureOptions={ this.state.questionTwoOrder }
					onSelectNextAdventure={ this.onRadioTwoChange }
					onChangeNextAdventureDetails={ this.onTextTwoChange }
					onChangeText={ this.onTextThreeChange }
					onValidationChange={ this.onNextAdventureValidationChange }
				/>
			);
		}

		if ( surveyStep === ATOMIC_REVERT_STEP ) {
			return (
				<AtomicRevertStep
					atomicTransfer={ atomicTransfer }
					purchase={ purchase }
					site={ site }
					atomicRevertCheckOne={ atomicRevertCheckOne }
					onClickCheckOne={ ( isChecked ) => this.setState( { atomicRevertCheckOne: isChecked } ) }
					atomicRevertCheckTwo={ atomicRevertCheckTwo }
					onClickCheckTwo={ ( isChecked ) => this.setState( { atomicRevertCheckTwo: isChecked } ) }
					hasBackupsFeature={ Boolean( hasBackupsFeature ) }
					isRemovePlan={ flowType === CANCEL_FLOW_TYPE.REMOVE && isPlan( purchase ) }
					action="cancel-purchase"
				/>
			);
		}

		if ( surveyStep === REMOVE_PLAN_STEP ) {
			return (
				<div className="cancel-purchase-form__remove-plan">
					<FormattedHeader
						brandFont
						headerText={ translate( 'Sorry to see you go' ) }
						subHeaderText={
							<>
								<span className="cancel-purchase-form__remove-plan-text">
									{
										// Translators: %(planName)s: name of the plan being canceled, eg: "WordPress.com Business"
										translate(
											'If you remove your plan, you will lose access to the features of the %(planName)s plan.',
											{
												args: {
													planName: productName,
												},
											}
										)
									}
								</span>
								{ ! isExpiredOrRemoved( purchase ) && (
									<span className="cancel-purchase-form__remove-plan-text">
										{
											// Translators: %(planName)s: name of the plan being canceled, eg: "WordPress.com Business". %(purchaseRenewalDate)s: date when the plan will expire, eg: "January 1, 2022"
											translate(
												'If you keep your plan, you will be able to continue using your %(planName)s plan features until {{strong}}%(purchaseRenewalDate)s{{/strong}}.',
												{
													args: {
														planName: productName,
														purchaseRenewalDate: moment( purchase.expiry_date ).format( 'LL' ),
													},
													components: {
														strong: <strong className="is-highlighted" />,
													},
												}
											)
										}
									</span>
								) }
							</>
						}
					/>
				</div>
			);
		}
	}

	closeDialog = () => {
		this.props.onClose();
		this.initSurveyState();

		this.recordEvent( 'calypso_purchases_cancel_form_close' );
	};

	changeSurveyStep = ( stepFunction: ( currentStep: string, steps: string[] ) => string ) => {
		const allSteps = this.getAllSurveySteps();
		const newStep = stepFunction( this.state.surveyStep ?? '', allSteps );

		this.setState( { surveyStep: newStep } );

		// Include upsell information when tracking the upsell step
		const eventProperties: Record< string, unknown > = { new_step: newStep };
		if ( newStep === UPSELL_STEP && this.state.upsell ) {
			eventProperties.upsell_type = this.state.upsell;
		}

		this.recordEvent( 'calypso_purchases_cancel_survey_step', eventProperties );
	};

	clickNext = () => {
		this.changeSurveyStep( nextStep );
	};

	canGoNext() {
		const { surveyStep, isSubmitting } = this.state;
		const { disableButtons, isImport } = this.props;

		if ( disableButtons || isSubmitting ) {
			return false;
		}

		if ( surveyStep === FEEDBACK_STEP ) {
			if ( isImport && ! this.state.importQuestionRadio ) {
				return false;
			}

			return Boolean( this.state.questionOneRadio && this.state.questionOneText );
		}

		if ( surveyStep === ATOMIC_REVERT_STEP ) {
			return Boolean( this.state.atomicRevertCheckOne && this.state.atomicRevertCheckTwo );
		}

		if ( surveyStep === NEXT_ADVENTURE_STEP ) {
			if ( this.state.questionTwoRadio === 'anotherReasonTwo' && ! this.state.questionTwoText ) {
				return false;
			}

			// For plan cancellations, require a valid selection from the adventure dropdown
			if ( ! this.state.isNextAdventureValid ) {
				return false;
			}

			return true;
		}

		return ! disableButtons && ! isSubmitting;
	}

	renderStepButtons = () => {
		const { translate, disableButtons, purchase, intent } = this.props;
		const { isSubmitting, surveyStep, solution } = this.state;
		const isCancelling = ( disableButtons || isSubmitting ) && ! solution;

		const allSteps = this.getAllSurveySteps();
		const isLastStep = surveyStep === allSteps[ allSteps.length - 1 ];

		if ( surveyStep === UPSELL_STEP ) {
			return null;
		}

		if ( ! isLastStep ) {
			return (
				<>
					<GutenbergButton
						isPrimary
						isDefault
						isDestructive={ intent === 'remove' }
						disabled={ ! this.canGoNext() }
						onClick={ this.clickNext }
					>
						{ intent === 'remove' ? translate( 'Continue removal' ) : translate( 'Continue' ) }
					</GutenbergButton>
					{ ( intent === 'cancel' || intent === 'auto-renew' ) && (
						<GutenbergButton
							isTertiary
							isBusy={ isCancelling }
							disabled={ isCancelling }
							onClick={ this.onSubmit }
						>
							{ translate( 'Skip survey' ) }
						</GutenbergButton>
					) }
				</>
			);
		}

		if ( surveyStep === REMOVE_PLAN_STEP ) {
			return (
				<>
					<GutenbergButton
						className="cancel-purchase-form__remove-plan-button"
						isPrimary
						isBusy={ isCancelling }
						disabled={ ! this.canGoNext() }
						onClick={ this.onSubmit }
					>
						{ translate( 'Remove %(productName)s', {
							args: { productName: purchase.product_name || 'plan' },
						} ) }
					</GutenbergButton>
					<GutenbergButton
						isSecondary
						isBusy={ isCancelling }
						disabled={ ! this.canGoNext() }
						onClick={ this.closeDialog }
					>
						{ translate( 'Keep plan' ) }
					</GutenbergButton>
				</>
			);
		}

		if ( intent === 'remove' ) {
			return (
				<>
					<GutenbergButton
						isPrimary
						isDefault
						isDestructive
						isBusy={ isCancelling }
						disabled={ ! this.canGoNext() }
						onClick={ this.onSubmit }
					>
						{ translate( 'Complete removal' ) }
					</GutenbergButton>
					<GutenbergButton
						isDestructive
						variant="tertiary"
						isBusy={ isCancelling }
						disabled={ isCancelling }
						onClick={ this.onSubmit }
					>
						{ translate( 'Skip and remove' ) }
					</GutenbergButton>
				</>
			);
		}

		return (
			<>
				<GutenbergButton
					isPrimary={ surveyStep !== UPSELL_STEP }
					isSecondary={ surveyStep === UPSELL_STEP }
					isDefault={ surveyStep !== UPSELL_STEP }
					isBusy={ isCancelling }
					disabled={ ! this.canGoNext() }
					onClick={ this.onSubmit }
				>
					{ intent === 'cancel' || intent === 'auto-renew'
						? translate( 'Complete' )
						: translate( 'Submit' ) }
				</GutenbergButton>
				{ ( intent === 'cancel' || intent === 'auto-renew' ) && (
					<GutenbergButton
						isTertiary
						isBusy={ isCancelling }
						disabled={ isCancelling }
						onClick={ this.onSubmit }
					>
						{ translate( 'Skip survey' ) }
					</GutenbergButton>
				) }
			</>
		);
	};

	fetchPurchaseExtendedStatus = async ( purchaseId: number ) => {
		const newState = {
			...this.state,
		};

		try {
			const res: { has_extended?: boolean } = await wpcom.req.get( {
				path: `/purchases/${ purchaseId }/has-extended`,
				apiNamespace: 'wpcom/v2',
			} );

			newState.purchaseIsAlreadyExtended = Boolean( res.has_extended );
		} catch {
			// When the request fails, set the flag to true so the extra options don't show up to users.
			newState.purchaseIsAlreadyExtended = true;
		}

		if ( newState.purchaseIsAlreadyExtended && newState.upsell === 'free-month-offer' ) {
			newState.upsell = '';
		}

		this.setState( newState );
	};

	componentDidUpdate( prevProps: CancelPurchaseFormProps ) {
		if (
			! prevProps.isVisible &&
			this.props.isVisible &&
			this.state.surveyStep === this.getAllSurveySteps()[ 0 ]
		) {
			this.recordEvent( 'calypso_purchases_cancel_form_start' );
		}
	}

	componentDidMount() {
		const { purchase } = this.props;

		this.initSurveyState();
		if ( this.props.isAtomicSite && purchase?.blog_id ) {
			this.props.fetchAtomicTransfer( purchase.blog_id );
		}

		if ( purchase?.ID && isWpComMonthlyPlan( purchase?.product_slug ) ) {
			this.fetchPurchaseExtendedStatus( purchase.ID );
		}
	}

	getHeaderTitle() {
		const { flowType, intent, purchase, translate } = this.props;

		if ( intent === 'auto-renew' ) {
			return translate( 'Disable auto-renew' );
		}

		if ( intent === 'remove' || flowType === CANCEL_FLOW_TYPE.REMOVE ) {
			if ( isPlan( purchase ) ) {
				return translate( 'Remove plan' );
			}
			return translate( 'Remove product' );
		}

		if ( flowType === CANCEL_FLOW_TYPE.CANCEL_AUTORENEW ) {
			if ( isPlan( purchase ) ) {
				return translate( 'Cancel plan' );
			}
			if ( isSubscription( purchase ) ) {
				return translate( 'Cancel subscription' );
			}
			return translate( 'Cancel product' );
		}

		if ( hasAmountAvailableToRefund( purchase ) ) {
			if ( isDomainRegistration( purchase ) ) {
				return translate( 'Cancel domain and refund' );
			}
			if ( isPlan( purchase ) ) {
				return translate( 'Cancel plan and refund' );
			}
			if ( isSubscription( purchase ) ) {
				return translate( 'Cancel subscription and refund' );
			}
			if ( isOneTimePurchase( purchase ) ) {
				return translate( 'Cancel and refund' );
			}
		}

		if ( isDomainRegistration( purchase ) ) {
			return translate( 'Cancel domain subscription' );
		}

		if ( isSubscription( purchase ) ) {
			return translate( 'Cancel subscription' );
		}

		return translate( 'Cancel product' );
	}

	getCanceledProduct() {
		const { purchase, translate } = this.props;
		const { product_slug: productSlug, product_name: productName, meta } = purchase;
		const { slug } = this.props.site as SiteDetails;
		const headerTitle = this.getHeaderTitle();
		switch ( productSlug ) {
			case 'domain_map':
				/* 	Translators: If canceled product is domain connection,
					displays canceled product and domain connection being canceled
					eg: "Remove product: Domain Connection for externaldomain.com" */
				return translate( '%(headerTitle)s: %(productName)s for %(purchaseMeta)s', {
					args: { headerTitle, productName, purchaseMeta: meta ?? '' },
				} );
			case 'offsite_redirect':
				/* 	Translators: If canceled product is site redirect,
					displays canceled product and domain site is being directed to
					eg: "Remove product: Site Redirect to redirectedsite.com" */
				return translate( '%(headerTitle)s: %(productName)s to %(purchaseMeta)s', {
					args: { headerTitle, productName, purchaseMeta: meta ?? '' },
				} );
			default:
				/* Translators: If canceled product is site plan or other product,
					displays plan or product being canceled and primary address of product being canceled
					eg: "Cancel plan: WordPress.com Business for primarydomain.com" */
				return translate( '%(headerTitle)s: %(productName)s for %(siteSlug)s', {
					args: { headerTitle, productName, siteSlug: slug },
				} );
		}
	}
	render() {
		const { purchase, site } = this.props;
		const { surveyStep } = this.state;

		if ( ! surveyStep ) {
			return null;
		}

		return (
			<>
				{ /** QueryProducts added to ensure currency-code state gets populated for usages of getCurrentUserCurrencyCode */ }
				<QueryProducts />
				{ site && <QuerySitePlans siteId={ site.ID } /> }
				{ this.props.isVisible && (
					<BlankCanvas className="cancel-purchase-form">
						<BlankCanvas.Header onBackClick={ this.closeDialog }>
							{ site && (
								<span className="cancel-purchase-form__site-slug">
									{ this.getCanceledProduct() }
								</span>
							) }
							<PrecancellationChatButton
								icon="chat_bubble"
								onClick={ this.closeDialog }
								purchase={ purchase }
								surveyStep={ surveyStep }
							/>
						</BlankCanvas.Header>
						{ this.props.cancellationInProgress && (
							<Spinner className="cancel-purchase-form__header-spinner" />
						) }
						<BlankCanvas.Content>{ this.surveyContent() }</BlankCanvas.Content>
						<BlankCanvas.Footer>
							<div className="cancel-purchase-form__actions">
								<div
									className={ `cancel-purchase-form__buttons cancel-purchase-form__${ surveyStep }-buttons` }
								>
									{ this.renderStepButtons() }
								</div>
							</div>
						</BlankCanvas.Footer>
					</BlankCanvas>
				) }
			</>
		);
	}
}

const ConnectedCancelPurchaseForm = connect(
	( state: IAppState, { purchase, linkedPurchases }: CancelPurchaseFormOwnProps ) => ( {
		isAtomicSite: isSiteAutomatedTransfer( state, purchase.blog_id ),
		isImport: !! getSiteImportEngine( state, purchase.blog_id ),
		site: getSite( state, purchase.blog_id ) ?? null,
		willAtomicSiteRevert: willAtomicSiteRevertAfterPurchaseDeactivation(
			state,
			purchase.ID,
			linkedPurchases ?? []
		),
		atomicTransfer: getAtomicTransfer( state, purchase.blog_id ),
		hasBackupsFeature: siteHasFeature( state, purchase.blog_id, WPCOM_FEATURES_BACKUPS ),
	} ),
	{
		cancelPurchaseSurveyCompleted,
		fetchAtomicTransfer,
		recordTracksEvent,
		submitSurvey,
	}
)( localize( withLocalizedMoment( CancelPurchaseForm ) ) );

type WrappedCancelPurchaseFormProps = Omit<
	CancelPurchaseFormOwnProps,
	'downgradePlanToPersonalPrice' | 'downgradePlanToMonthlyPrice' | 'isSplitCancelRemoveEnabled'
>;

const WrappedCancelPurchaseForm = ( props: WrappedCancelPurchaseFormProps ) => {
	const productSlug = props.purchase.product_slug;
	const personalDowngradePlan = getDowngradePlanFromPurchase( { productSlug } );
	const monthlyDowngradePlan = getDowngradePlanToMonthlyFromPurchase( { productSlug } );
	const personalSlug = personalDowngradePlan?.getStoreSlug();
	const monthlySlug = monthlyDowngradePlan?.getStoreSlug();
	const pricingMeta = Plans.usePricingMetaForGridPlans( {
		planSlugs: [ personalSlug, monthlySlug ].filter( ( slug ): slug is PlanSlug =>
			Boolean( slug )
		),
		coupon: undefined,
		siteId: null,
		useCheckPlanAvailabilityForPurchase,
	} );
	const isSplitCancelRemoveEnabled = useIsSplitCancelRemoveEnabled();

	return (
		<ConnectedCancelPurchaseForm
			{ ...props }
			downgradePlanToPersonalPrice={
				personalSlug ? pricingMeta?.[ personalSlug ]?.originalPrice?.full : undefined
			}
			downgradePlanToMonthlyPrice={
				monthlySlug ? pricingMeta?.[ monthlySlug ]?.originalPrice?.full : undefined
			}
			isSplitCancelRemoveEnabled={ isSplitCancelRemoveEnabled }
		/>
	);
};

export default WrappedCancelPurchaseForm;
