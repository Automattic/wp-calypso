import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { intlFormat } from 'date-fns';
import { ButtonStack } from '../../../../components/button-stack';
import { CANCEL_FLOW_TYPE } from '../../../../utils/purchase';
import { AtomicRevertStep } from './step-components/atomic-revert-step';
import EducationContentStep from './step-components/educational-content-step';
import FeedbackStep from './step-components/feedback-step';
import JetpackCancellationOfferAcceptedStep from './step-components/jetpack-cancellation-offer-accepted-step';
import JetpackCancellationOfferStep from './step-components/jetpack-cancellation-offer-step';
import NextAdventureStep from './step-components/next-adventure-step';
import UpsellStep from './step-components/upsell-step';
import {
	ATOMIC_REVERT_STEP,
	CANCELLATION_OFFER_STEP,
	FEEDBACK_STEP,
	NEXT_ADVENTURE_STEP,
	OFFER_ACCEPTED_STEP,
	REMOVE_PLAN_STEP,
	UPSELL_STEP,
} from './steps';
import type {
	AtomicTransfer,
	CancellationOffer,
	PlanProduct,
	Purchase,
} from '@automattic/api-core';

import './style.scss';

interface CancelPurchaseFormProps {
	atomicRevertCheckOne?: boolean;
	atomicRevertCheckTwo?: boolean;
	atomicRevertOnClickCheckOne: ( isChecked: boolean ) => void;
	atomicRevertOnClickCheckTwo: ( isChecked: boolean ) => void;
	atomicTransfer?: Pick< AtomicTransfer, 'created_at' >;
	cancelBundledDomain?: boolean;
	cancellationInProgress?: boolean;
	cancellationOffer?: Pick<
		CancellationOffer,
		'discounted_periods' | 'raw_price' | 'currency_code' | 'original_price'
	>;
	clickNext?: () => void;
	closeDialog?: () => void;
	disableButtons?: boolean;
	downgradeClick?: ( upsell: string ) => void;
	downgradePlanToMonthlyPrice?: number;
	downgradePlanToPersonalPrice?: number;
	flowType?: string;
	freeMonthOfferClick?: () => void;
	getAllSurveySteps?: () => string[];
	hasBackupsFeature?: boolean;
	importQuestionRadio?: string;
	includedDomainPurchase?: Purchase;
	isAkismet?: boolean;
	isApplyingOffer?: boolean;
	isImport?: boolean;
	isNextAdventureValid?: boolean;
	isShowing?: boolean;
	isSubmitting?: boolean;
	isVisible?: boolean;
	offerApplyError?: Error | null;
	offerDiscountBasedFromPurchasePrice: number;
	onClickAcceptForCancellationOffer?: () => void;
	onGetCancellationOffer: () => void;
	onImportRadioChange: ( eventOrValue: React.ChangeEvent< HTMLInputElement > | string ) => void;
	onNextAdventureValidationChange?: ( isValid: boolean ) => void;
	onRadioOneChange: ( eventOrValue: React.ChangeEvent< HTMLInputElement > | string ) => void;
	onRadioTwoChange?: ( eventOrValue: React.ChangeEvent< HTMLInputElement > | string ) => void;
	onSubmit?: () => void;
	onSurveyComplete?: () => void;
	onTextOneChange: (
		eventOrValue: React.ChangeEvent< HTMLInputElement > | string,
		detailsValue?: string
	) => void;
	onTextThreeChange?: ( eventOrValue: React.ChangeEvent< HTMLInputElement > | string ) => void;
	onTextTwoChange?: ( eventOrValue: React.ChangeEvent< HTMLInputElement > | string ) => void;
	plans: PlanProduct[];
	purchase: Purchase;
	questionOneOrder: string[];
	questionOneRadio?: string;
	questionOneText?: string;
	questionTwoOrder?: string[];
	questionTwoRadio?: string;
	questionTwoText?: string;
	refundAmount?: number;
	siteSlug: string;
	solution?: string;
	surveyStep?: string;
	upsell?: string;
	willAtomicSiteRevert?: boolean;
}

export default function CancelPurchaseForm( props: CancelPurchaseFormProps ) {
	const { purchase, siteSlug } = props;
	/**
	 * Get possible steps for the survey
	 */
	const surveyContent = () => {
		const {
			atomicRevertCheckOne,
			atomicRevertCheckTwo,
			atomicRevertOnClickCheckOne,
			atomicRevertOnClickCheckTwo,
			atomicTransfer,
			cancellationOffer,
			clickNext,
			closeDialog,
			downgradeClick,
			flowType,
			freeMonthOfferClick,
			getAllSurveySteps,
			hasBackupsFeature,
			isImport,
			offerDiscountBasedFromPurchasePrice,
			onGetCancellationOffer,
			onImportRadioChange,
			onNextAdventureValidationChange,
			onRadioOneChange,
			onRadioTwoChange,
			onSubmit,
			onTextOneChange,
			onTextThreeChange,
			onTextTwoChange,
			plans,
			purchase,
			questionOneOrder,
			questionOneText,
			questionTwoOrder,
			refundAmount,
			surveyStep,
			upsell,
		} = props;
		const { product_name: productName } = purchase;
		if ( surveyStep === FEEDBACK_STEP ) {
			return (
				<FeedbackStep
					cancellationReasonCodes={ questionOneOrder }
					isImport={ isImport ?? false }
					onChangeCancellationReason={ onRadioOneChange }
					onChangeCancellationReasonDetails={ onTextOneChange }
					onChangeImportFeedback={ onImportRadioChange }
					plans={ plans }
					purchase={ purchase }
				/>
			);
		}

		if ( surveyStep === UPSELL_STEP ) {
			const allSteps = getAllSurveySteps && getAllSurveySteps();
			const isLastStep = surveyStep === allSteps?.[ allSteps.length - 1 ];

			if ( upsell?.startsWith( 'education:' ) ) {
				return (
					<EducationContentStep
						cancellationReason={ questionOneText }
						onDecline={ isLastStep ? onSubmit : clickNext }
						siteSlug={ siteSlug }
						type={ upsell }
					/>
				);
			}

			return (
				<UpsellStep
					cancelBundledDomain={ props.cancelBundledDomain }
					cancellationInProgress={ props.cancellationInProgress }
					cancellationReason={ questionOneText }
					closeDialog={ closeDialog }
					currencyCode={ purchase.currency_code }
					downgradePlanPrice={
						'downgrade-personal' === upsell
							? props.downgradePlanToPersonalPrice
							: props.downgradePlanToMonthlyPrice
					}
					includedDomainPurchase={ props.includedDomainPurchase }
					onClickDowngrade={ downgradeClick }
					onClickFreeMonthOffer={ freeMonthOfferClick }
					onDeclineUpsell={ isLastStep ? onSubmit : clickNext }
					plans={ plans }
					purchase={ purchase }
					refundAmount={ refundAmount }
					upsell={ upsell ?? '' }
				/>
			);
		}

		if ( surveyStep === NEXT_ADVENTURE_STEP ) {
			return (
				<NextAdventureStep
					adventureOptions={ questionTwoOrder ?? [] }
					isPlan={ purchase.is_plan }
					onChangeNextAdventureDetails={ onTextTwoChange }
					onChangeText={ onTextThreeChange }
					onSelectNextAdventure={ onRadioTwoChange }
					onValidationChange={ onNextAdventureValidationChange }
				/>
			);
		}

		if ( surveyStep === ATOMIC_REVERT_STEP ) {
			return (
				<AtomicRevertStep
					action="cancel-purchase"
					atomicRevertCheckOne={ atomicRevertCheckOne ?? false }
					atomicRevertCheckTwo={ atomicRevertCheckTwo ?? false }
					atomicTransfer={ atomicTransfer }
					hasBackupsFeature={ hasBackupsFeature ?? false }
					isRemovePlan={ flowType === CANCEL_FLOW_TYPE.REMOVE && purchase.is_plan }
					onClickCheckOne={ atomicRevertOnClickCheckOne }
					onClickCheckTwo={ atomicRevertOnClickCheckTwo }
					purchase={ purchase }
					siteSlug={ siteSlug }
				/>
			);
		}

		if ( surveyStep === REMOVE_PLAN_STEP ) {
			return (
				<>
					<span className="cancel-purchase-form__remove-plan-text">
						{ sprintf(
							/* Translators: %(planName)s: name of the plan being canceled, eg: "WordPress.com Business" */
							__(
								'If you remove your plan, you will lose access to the features of the %(planName)s plan.'
							),
							{
								planName: productName,
							}
						) }
					</span>
					<span className="cancel-purchase-form__remove-plan-text">
						{ createInterpolateElement(
							sprintf(
								/* Translators: %(planName)s: name of the plan being canceled, eg: "WordPress.com Business". %(purchaseRenewalDate)s: date when the plan will expire, eg: "January 1, 2022" */
								__(
									'If you keep your plan, you will be able to continue using your %(planName)s plan features until <strong>%(purchaseRenewalDate)s</strong>.'
								),
								{
									planName: productName,
									purchaseRenewalDate: intlFormat( purchase.expiry_date, {
										dateStyle: 'medium',
									} ),
								}
							),
							{
								strong: <strong className="is-highlighted" />,
							}
						) }
					</span>
				</>
			);
		}
		// Step 3: Offer
		// This step is only made available after offers are checked for/ loaded.
		if ( surveyStep === CANCELLATION_OFFER_STEP && cancellationOffer ) {
			// Show an offer, the user can accept it or go ahead with the cancellation.
			return (
				<JetpackCancellationOfferStep
					isAkismet={ props?.isAkismet }
					offer={ cancellationOffer }
					onGetCancellationOffer={ onGetCancellationOffer }
					percentDiscount={ offerDiscountBasedFromPurchasePrice }
					purchase={ purchase }
				/>
			);
		}

		// Step 4: Offer Accepted
		if ( surveyStep === OFFER_ACCEPTED_STEP ) {
			// Show after an offer discount has been accepted
			return (
				<JetpackCancellationOfferAcceptedStep
					isAkismet={ props?.isAkismet }
					percentDiscount={ offerDiscountBasedFromPurchasePrice }
					productName={ productName }
				/>
			);
		}
	};

	const canGoNext = () => {
		const {
			atomicRevertCheckOne,
			atomicRevertCheckTwo,
			disableButtons,
			importQuestionRadio,
			isImport,
			isNextAdventureValid,
			isSubmitting,
			questionOneRadio,
			questionOneText,
			questionTwoRadio,
			questionTwoText,
			surveyStep,
		} = props;

		if ( disableButtons || isSubmitting ) {
			return false;
		}

		if ( surveyStep === FEEDBACK_STEP ) {
			if ( isImport && ! importQuestionRadio ) {
				return false;
			}

			return Boolean(
				questionOneRadio &&
					( purchase.is_jetpack_plan_or_product || ! purchase.is_plan || questionOneText )
			);
		}

		if ( surveyStep === ATOMIC_REVERT_STEP ) {
			return Boolean( atomicRevertCheckOne && atomicRevertCheckTwo );
		}

		if ( surveyStep === NEXT_ADVENTURE_STEP ) {
			if ( questionTwoRadio === 'anotherReasonTwo' && ! questionTwoText ) {
				return false;
			}

			// For plan cancellations, require a valid selection from the adventure dropdown
			if ( purchase.is_plan && ! isNextAdventureValid ) {
				return false;
			}

			return true;
		}

		return ! disableButtons && ! isSubmitting;
	};

	const renderStepButtons = () => {
		const {
			clickNext,
			closeDialog,
			disableButtons,
			getAllSurveySteps,
			isApplyingOffer,
			isSubmitting,
			offerApplyError,
			onClickAcceptForCancellationOffer,
			onSubmit,
			solution,
			surveyStep,
		} = props;
		const isCancelling = ( disableButtons || isSubmitting ) && ! solution;

		const allSteps = getAllSurveySteps && getAllSurveySteps();
		const isLastStep = surveyStep === allSteps?.[ allSteps.length - 1 ];

		if ( surveyStep === UPSELL_STEP ) {
			return null;
		}

		if ( ! isLastStep ) {
			return (
				<ButtonStack justify="flex-start">
					<Button variant="secondary" disabled={ ! canGoNext() } onClick={ clickNext }>
						{ __( 'Continue' ) }
					</Button>
					<Button variant="link" onClick={ onSubmit }>
						{ __( 'Skip' ) }
					</Button>
				</ButtonStack>
			);
		}

		if ( surveyStep === REMOVE_PLAN_STEP ) {
			return (
				<ButtonStack>
					<Button
						className="cancel-purchase-form__remove-plan-button"
						disabled={ ! canGoNext() }
						isBusy={ isCancelling }
						onClick={ onSubmit }
						variant="primary"
					>
						{ __( 'Submit' ) }
					</Button>
					<Button
						disabled={ ! canGoNext() }
						isBusy={ isCancelling }
						onClick={ closeDialog }
						variant="secondary"
					>
						{ __( 'Keep plan' ) }
					</Button>
				</ButtonStack>
			);
		}

		if ( surveyStep === CANCELLATION_OFFER_STEP ) {
			return (
				<ButtonStack>
					<Button
						disabled={
							! canGoNext() || disableButtons /* || disableContinuation || applyingOffer*/
						}
						isBusy={ isCancelling }
						onClick={ onSubmit }
						variant="primary"
					>
						{ __( 'No, thanks' ) }
					</Button>
					<Button
						className="jetpack-cancellation-offer__accept-cta"
						disabled={ isApplyingOffer ?? ( false || Boolean( offerApplyError ) ) ?? false }
						isBusy={ isApplyingOffer ?? false }
						onClick={ () => {
							onClickAcceptForCancellationOffer && onClickAcceptForCancellationOffer();
						} }
						variant="primary"
					>
						{ isApplyingOffer ? __( 'Getting Discount' ) : __( 'Get discount' ) }
					</Button>
				</ButtonStack>
			);
		}

		const variant = surveyStep !== UPSELL_STEP ? 'primary' : 'secondary';

		return (
			<ButtonStack justify="flex-start">
				<Button
					disabled={ ! canGoNext() }
					isBusy={ isCancelling }
					onClick={ onSubmit }
					variant={ variant }
				>
					{ __( 'Submit' ) }
				</Button>
				{ ! canGoNext() && ! isCancelling && (
					<Button variant="link" onClick={ onSubmit }>
						{ __( 'Skip' ) }
					</Button>
				) }
			</ButtonStack>
		);
	};

	return (
		props.isVisible && (
			<>
				{ surveyContent() }

				{ renderStepButtons() }
			</>
		)
	);
}
