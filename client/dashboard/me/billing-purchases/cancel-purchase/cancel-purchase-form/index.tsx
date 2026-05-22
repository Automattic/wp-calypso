import { Button, __experimentalVStack as VStack } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { intlFormat } from 'date-fns';
import { ButtonStack } from '../../../../components/button-stack';
import { SectionHeader } from '../../../../components/section-header';
import {
	CANCEL_FLOW_TYPE,
	type CancelFlowType,
	type CancelIntent,
} from '../../../../utils/purchase';
import { getSolutionsForReason } from '../get-solutions-for-reason';
import { useIsSplitCancelRemoveEnabled } from '../use-is-split-cancel-remove-enabled';
import { AtomicRevertStep } from './step-components/atomic-revert-step';
import EducationContentStep from './step-components/educational-content-step';
import FeedbackStep from './step-components/feedback-step';
import JetpackCancellationOfferStep from './step-components/jetpack-cancellation-offer-step';
import NextAdventureStep from './step-components/next-adventure-step';
import SolutionsCardsUpsellStep from './step-components/solutions-cards-upsell-step';
import UpsellStep from './step-components/upsell-step';
import {
	ATOMIC_REVERT_STEP,
	CANCELLATION_OFFER_STEP,
	FEEDBACK_STEP,
	NEXT_ADVENTURE_STEP,
	REMOVE_PLAN_STEP,
	UPSELL_STEP,
} from './steps';
import type {
	AtomicTransfer,
	CancellationOffer,
	PlanProduct,
	Purchase,
} from '@automattic/api-core';

interface CancelPurchaseFormProps {
	atomicRevertCheckOne?: boolean;
	atomicRevertCheckTwo?: boolean;
	atomicRevertOnClickCheckOne: ( isChecked: boolean ) => void;
	atomicRevertOnClickCheckTwo: ( isChecked: boolean ) => void;
	atomicTransfer?: Pick< AtomicTransfer, 'created_at' >;
	cancelBundledDomain?: boolean;
	cancellationInProgress?: boolean;
	intent?: CancelIntent | null;
	cancellationOffer?: Pick<
		CancellationOffer,
		'discounted_periods' | 'raw_price' | 'currency_code' | 'original_price'
	>;
	clickNext?: () => void;
	closeDialog?: () => void;
	disableButtons?: boolean;
	downgradeClick?: ( upsell: string ) => void;
	downgradePlan?: PlanProduct;
	downgradePlanToMonthlyPrice?: number;
	downgradePlanToPersonalPrice?: number;
	flowType?: CancelFlowType;
	freeMonthOfferClick?: () => void;
	allSteps: string[];
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
	onGetCancellationOffer: ( newPurchaseId?: string ) => void;
	onImportRadioChange: ( eventOrValue: React.ChangeEvent< HTMLInputElement > | string ) => void;
	onNextAdventureValidationChange?: ( isValid: boolean ) => void;
	onRadioOneChange: ( eventOrValue: React.ChangeEvent< HTMLInputElement > | string ) => void;
	onRadioTwoChange?: ( eventOrValue: React.ChangeEvent< HTMLInputElement > | string ) => void;
	onSubmit?: () => void;
	onSurveyComplete?: () => void;
	onSwitchToMonthly?: () => void;
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

function SurveyContent( {
	atomicRevertCheckOne,
	atomicRevertCheckTwo,
	atomicRevertOnClickCheckOne,
	atomicRevertOnClickCheckTwo,
	atomicTransfer,
	cancellationOffer,
	clickNext,
	closeDialog,
	downgradeClick,
	downgradePlan,
	flowType,
	freeMonthOfferClick,
	allSteps,
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
	siteSlug,
	cancelBundledDomain,
	cancellationInProgress,
	includedDomainPurchase,
	isAkismet,
	intent,
	onSwitchToMonthly,
}: CancelPurchaseFormProps ) {
	const { product_name: productName } = purchase;
	const isSplitCancelRemoveEnabled = useIsSplitCancelRemoveEnabled();
	if ( surveyStep === FEEDBACK_STEP ) {
		return (
			<FeedbackStep
				cancellationReasonCodes={ questionOneOrder }
				isImport={ isImport ?? false }
				intent={ intent ?? undefined }
				onChangeCancellationReason={ onRadioOneChange }
				onChangeCancellationReasonDetails={ onTextOneChange }
				onChangeImportFeedback={ onImportRadioChange }
				plans={ plans }
				purchase={ purchase }
			/>
		);
	}

	if ( surveyStep === UPSELL_STEP ) {
		const isLastStep = surveyStep === allSteps?.[ allSteps.length - 1 ];

		const solutions = getSolutionsForReason( questionOneText ?? '' );
		const useSolutionsCards = isSplitCancelRemoveEnabled && solutions && solutions.length > 0;

		if ( useSolutionsCards ) {
			return (
				<SolutionsCardsUpsellStep
					cancellationInProgress={ cancellationInProgress }
					cancellationReason={ questionOneText }
					cancelBundledDomain={ cancelBundledDomain }
					closeDialog={ closeDialog }
					downgradePlan={ downgradePlan }
					includedDomainPurchase={ includedDomainPurchase }
					intent={ intent ?? undefined }
					onClickDowngrade={ downgradeClick }
					onDeclineUpsell={ isLastStep ? onSubmit : clickNext }
					onSwitchToMonthly={ onSwitchToMonthly }
					purchase={ purchase }
					refundAmount={ refundAmount }
				/>
			);
		}

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
				cancelBundledDomain={ cancelBundledDomain }
				cancellationInProgress={ cancellationInProgress }
				cancellationReason={ questionOneText }
				closeDialog={ closeDialog }
				currencyCode={ purchase.currency_code }
				declineButtonText={ intent === 'remove' ? __( 'Continue removal' ) : __( 'No, thanks' ) }
				downgradePlan={ downgradePlan }
				includedDomainPurchase={ includedDomainPurchase }
				intent={ intent ?? undefined }
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
				isAkismet={ isAkismet }
				offer={ cancellationOffer }
				onGetCancellationOffer={ onGetCancellationOffer }
				percentDiscount={ offerDiscountBasedFromPurchasePrice }
				purchase={ purchase }
			/>
		);
	}

	return null;
}

function StepButtons( {
	canGoNext,
	clickNext,
	closeDialog,
	disableButtons,
	intent,
	isSubmitting,
	onSubmit,
	solution,
	surveyStep,
	allSteps,
	onClickAcceptForCancellationOffer,
	isApplyingOffer,
	offerApplyError,
}: {
	canGoNext: boolean;
} & CancelPurchaseFormProps ) {
	const isCancelling = ( disableButtons || isSubmitting ) && ! solution;

	const isLastStep = surveyStep === allSteps?.[ allSteps.length - 1 ];

	if ( surveyStep === UPSELL_STEP ) {
		return null;
	}

	if ( ! isLastStep ) {
		if ( intent === 'remove' ) {
			return (
				<ButtonStack justify="flex-start">
					<Button
						variant="primary"
						isDestructive
						disabled={ ! canGoNext || isCancelling }
						onClick={ clickNext }
					>
						{ __( 'Continue removal' ) }
					</Button>
				</ButtonStack>
			);
		}

		return (
			<ButtonStack justify="flex-start">
				<Button variant="primary" disabled={ ! canGoNext || isCancelling } onClick={ clickNext }>
					{ __( 'Continue' ) }
				</Button>
				{ ( intent === 'cancel' || intent === 'auto-renew' ) && (
					<Button
						variant="tertiary"
						isBusy={ isCancelling }
						disabled={ isCancelling }
						onClick={ onSubmit }
					>
						{ __( 'No, thanks' ) }
					</Button>
				) }
			</ButtonStack>
		);
	}

	if ( surveyStep === REMOVE_PLAN_STEP ) {
		return (
			<ButtonStack justify="flex-start">
				<Button
					className="cancel-purchase-form__remove-plan-button"
					disabled={ ! canGoNext }
					isBusy={ isCancelling }
					onClick={ onSubmit }
					variant="primary"
				>
					{ __( 'Continue' ) }
				</Button>
				<Button
					disabled={ ! canGoNext }
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
			<ButtonStack justify="flex-start">
				<Button
					className="jetpack-cancellation-offer__accept-cta"
					disabled={ isApplyingOffer || Boolean( offerApplyError ) }
					isBusy={ isApplyingOffer ?? false }
					onClick={ () => {
						onClickAcceptForCancellationOffer && onClickAcceptForCancellationOffer();
					} }
					variant="primary"
				>
					{ isApplyingOffer ? __( 'Getting discount' ) : __( 'Get discount' ) }
				</Button>
				<Button
					disabled={ ! canGoNext || disableButtons }
					isBusy={ isCancelling }
					onClick={ onSubmit }
					variant="secondary"
				>
					{ __( 'No, thanks' ) }
				</Button>
			</ButtonStack>
		);
	}

	if ( intent === 'remove' ) {
		return (
			<ButtonStack justify="flex-start">
				<Button
					isDestructive
					disabled={ ! canGoNext }
					isBusy={ isCancelling }
					onClick={ onSubmit }
					variant="primary"
				>
					{ __( 'Complete removal' ) }
				</Button>
				<Button
					isDestructive
					variant="tertiary"
					isBusy={ isCancelling }
					disabled={ isCancelling }
					onClick={ onSubmit }
				>
					{ __( 'Skip and remove' ) }
				</Button>
			</ButtonStack>
		);
	}

	const variant = surveyStep !== UPSELL_STEP ? 'primary' : 'secondary';

	return (
		<ButtonStack justify="flex-start">
			<Button
				disabled={ ! canGoNext }
				isBusy={ isCancelling }
				onClick={ onSubmit }
				variant={ variant }
			>
				{ intent === 'cancel' || intent === 'auto-renew' ? __( 'Complete' ) : __( 'Continue' ) }
			</Button>
			{ ( intent === 'cancel' || intent === 'auto-renew' ) && (
				<Button
					variant="tertiary"
					isBusy={ isCancelling }
					disabled={ isCancelling }
					onClick={ onSubmit }
				>
					{ __( 'No, thanks' ) }
				</Button>
			) }
		</ButtonStack>
	);
}

function canGoToNextStep( {
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
	purchase,
}: CancelPurchaseFormProps ): boolean {
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
}

function getSurveyTitle( surveyStep: string ) {
	if ( surveyStep === CANCELLATION_OFFER_STEP ) {
		return '';
	}
	if ( surveyStep === UPSELL_STEP ) {
		return '';
	}

	return __( 'Before you go, please answer a few quick questions to help us improve.' );
}

export default function CancelPurchaseForm( props: CancelPurchaseFormProps ) {
	const title = getSurveyTitle( props.surveyStep ?? '' );
	return (
		props.isVisible && (
			<VStack spacing={ 6 }>
				{ title && <SectionHeader title={ title } level={ 3 } /> }
				<SurveyContent { ...props } />
				<StepButtons { ...props } canGoNext={ canGoToNextStep( props ) } />
			</VStack>
		)
	);
}
