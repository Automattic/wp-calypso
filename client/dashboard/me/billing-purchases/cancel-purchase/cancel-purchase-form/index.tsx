import { WPCOM_FEATURES_BACKUPS } from '@automattic/api-core';
import { siteFeaturesQuery, siteLatestAtomicTransferQuery } from '@automattic/api-queries';
import { useSuspenseQuery, useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { intlFormat } from 'date-fns';
import { useMemo } from 'react';
import { ButtonStack } from '../../../../components/button-stack';
import { CANCEL_FLOW_TYPE } from '../../../../utils/purchase';
import { isSiteAutomatedTransfer } from '../../../../utils/site-types';
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
	Site,
	Purchase,
	PlanProduct,
	Product,
	SiteSpecificPlanProduct,
	CancellationOffer,
} from '@automattic/api-core';

import './style.scss';

export interface CancelPurchaseFormProps {
	atomicRevertCheckOne?: boolean;
	atomicRevertCheckTwo?: boolean;
	atomicRevertOnClickCheckOne: ( isChecked: boolean ) => void;
	atomicRevertOnClickCheckTwo: ( isChecked: boolean ) => void;
	atomicTransfer?: { created_at: string }; //TODO: maybe delete
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
	downgradePlanToPersonalPrice?: number; //TODO: maybe delete
	downgradePlanToMonthlyPrice?: number; //TODO: maybe delete
	flowType?: string;
	freeMonthOfferClick?: () => void;
	getAllSurveySteps?: () => string[];
	hasBackupsFeature?: boolean;
	importQuestionRadio?: string;
	includedDomainPurchase?: Purchase;
	isAkismet?: boolean; //TODO: maybe delete
	isApplyingOffer?: boolean; //TODO: maybe delete
	isAtomicSite?: boolean; //TODO: maybe delete
	isImport?: boolean; //TODO: maybe delete
	isNextAdventureValid?: boolean;
	isShowing?: boolean;
	isSubmitting?: boolean;
	isVisible?: boolean;
	offerApplyError?: Error | null;
	offerDiscountBasedFromPurchasePrice: number; //TODO: maybe delete
	onClose?: () => void; //TODO: maybe delete
	onClickAccept?: () => void; //TODO: maybe delete
	onGetDiscount: () => void; //TODO: maybe delete
	onImportRadioChange: ( eventOrValue: React.ChangeEvent< HTMLInputElement > | string ) => void; //TODO: maybe delete
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
	products?: Product[];
	purchase: Purchase;
	purchases: Purchase[];
	questionOneOrder: string[];
	questionOneRadio?: string;
	questionOneText?: string;
	questionTwoOrder?: string[];
	questionTwoRadio?: string;
	questionTwoText?: string;
	refundAmount?: string;
	site?: Site;
	sitePlans?: SiteSpecificPlanProduct[];
	sitePurchases: Purchase[];
	solution?: string;
	surveyStep?: string;
	upsell?: string;
	willAtomicSiteRevert?: boolean;
}

function getSiteImportEngine( site: Site ) {
	return site?.options?.import_engine ?? null;
}

export default function CancelPurchaseForm( providedProps: CancelPurchaseFormProps ) {
	const { purchase, site } = providedProps;
	const { data: siteFeatures } = useSuspenseQuery( siteFeaturesQuery( purchase.blog_id ) );
	const { data: atomicTransfer } = useQuery( siteLatestAtomicTransferQuery( purchase.blog_id ) );
	const props = useMemo(
		() => ( {
			...providedProps,
			isAtomicSite: providedProps.isAtomicSite ?? isSiteAutomatedTransfer( site ),
			isImport: providedProps.isImport ?? Boolean( site && getSiteImportEngine( site ) ),
			site: providedProps.site,
			atomicTransfer: providedProps.atomicTransfer ?? atomicTransfer,
			hasBackupsFeature:
				providedProps.hasBackupsFeature ??
				siteFeatures?.active?.indexOf( WPCOM_FEATURES_BACKUPS ) >= 0,
		} ),
		[ atomicTransfer, providedProps, site, siteFeatures?.active ]
	);
	/**
	 * Get possible steps for the survey
	 */
	const surveyContent = () => {
		const {
			atomicTransfer,
			isImport,
			purchase,
			site,
			hasBackupsFeature,
			flowType,
			refundAmount,
			atomicRevertOnClickCheckOne,
			atomicRevertOnClickCheckTwo,
			atomicRevertCheckOne,
			atomicRevertCheckTwo,
			surveyStep,
			upsell,
			plans,
			questionOneOrder,
			questionOneText,
			questionTwoOrder,
			downgradeClick,
			closeDialog,
			onSubmit,
			clickNext,
			cancellationOffer,
			onRadioOneChange,
			onTextOneChange,
			onRadioTwoChange,
			onTextTwoChange,
			onImportRadioChange,
			freeMonthOfferClick,
			onGetDiscount,
			getAllSurveySteps,
			offerDiscountBasedFromPurchasePrice,
			onTextThreeChange,
			onNextAdventureValidationChange,
		} = props;
		const { product_name: productName } = purchase;
		if ( surveyStep === FEEDBACK_STEP ) {
			return (
				<FeedbackStep
					plans={ plans }
					purchase={ purchase }
					isImport={ isImport }
					cancellationReasonCodes={ questionOneOrder }
					onChangeCancellationReason={ onRadioOneChange }
					onChangeCancellationReasonDetails={ onTextOneChange }
					onChangeImportFeedback={ onImportRadioChange }
				/>
			);
		}

		if ( surveyStep === UPSELL_STEP ) {
			const allSteps = getAllSurveySteps && getAllSurveySteps();
			const isLastStep = surveyStep === allSteps?.[ allSteps.length - 1 ];

			if ( upsell?.startsWith( 'education:' ) ) {
				return (
					<EducationContentStep
						type={ upsell }
						site={ site }
						onDecline={ isLastStep ? onSubmit : clickNext }
						cancellationReason={ questionOneText }
					/>
				);
			}

			return (
				<UpsellStep
					upsell={ upsell ?? '' }
					cancellationReason={ questionOneText }
					purchase={ purchase }
					currencyCode={ purchase.currency_code }
					site={ site }
					refundAmount={ refundAmount }
					downgradePlanPrice={
						'downgrade-personal' === upsell
							? props.downgradePlanToPersonalPrice
							: props.downgradePlanToMonthlyPrice
					}
					closeDialog={ closeDialog }
					plans={ plans }
					cancelBundledDomain={ props.cancelBundledDomain }
					includedDomainPurchase={ props.includedDomainPurchase }
					onDeclineUpsell={ isLastStep ? onSubmit : clickNext }
					onClickDowngrade={ downgradeClick }
					onClickFreeMonthOffer={ freeMonthOfferClick }
				/>
			);
		}

		if ( surveyStep === NEXT_ADVENTURE_STEP ) {
			return (
				<NextAdventureStep
					isPlan={ purchase.is_plan }
					adventureOptions={ questionTwoOrder ?? [] }
					onSelectNextAdventure={ onRadioTwoChange }
					onChangeNextAdventureDetails={ onTextTwoChange }
					onChangeText={ onTextThreeChange }
					onValidationChange={ onNextAdventureValidationChange }
				/>
			);
		}

		if ( surveyStep === ATOMIC_REVERT_STEP ) {
			return (
				<AtomicRevertStep
					atomicTransfer={ atomicTransfer }
					purchase={ purchase }
					site={ site }
					action="cancel-purchase"
					atomicRevertCheckOne={ atomicRevertCheckOne ?? false }
					onClickCheckOne={ atomicRevertOnClickCheckOne }
					atomicRevertCheckTwo={ atomicRevertCheckTwo ?? false }
					onClickCheckTwo={ atomicRevertOnClickCheckTwo }
					hasBackupsFeature={ hasBackupsFeature }
					isRemovePlan={ flowType === CANCEL_FLOW_TYPE.REMOVE && purchase.is_plan }
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
					siteId={ purchase.blog_id }
					purchase={ purchase }
					offer={ cancellationOffer }
					percentDiscount={ offerDiscountBasedFromPurchasePrice }
					onGetDiscount={ onGetDiscount }
					isAkismet={ !! props?.isAkismet }
				/>
			);
		}

		// Step 4: Offer Accepted
		if ( surveyStep === OFFER_ACCEPTED_STEP ) {
			// Show after an offer discount has been accepted
			return (
				<JetpackCancellationOfferAcceptedStep
					siteId={ purchase.blog_id }
					percentDiscount={ offerDiscountBasedFromPurchasePrice }
					productName={ productName }
					isAkismet={ !! props?.isAkismet }
				/>
			);
		}
	};

	const canGoNext = () => {
		const {
			surveyStep,
			isSubmitting,
			disableButtons,
			isImport,
			importQuestionRadio,
			questionOneRadio,
			questionOneText,
			questionTwoRadio,
			questionTwoText,
			atomicRevertCheckOne,
			atomicRevertCheckTwo,
			isNextAdventureValid,
		} = props;

		if ( disableButtons || isSubmitting ) {
			return false;
		}

		if ( surveyStep === FEEDBACK_STEP ) {
			if ( isImport && ! importQuestionRadio ) {
				return false;
			}

			return Boolean( questionOneRadio && ( ! purchase.is_plan || questionOneText ) );
		}

		if ( surveyStep === ATOMIC_REVERT_STEP ) {
			return Boolean( atomicRevertCheckOne && atomicRevertCheckTwo );
		}

		if ( surveyStep === NEXT_ADVENTURE_STEP ) {
			if ( questionTwoRadio === 'anotherReasonTwo' && ! questionTwoText ) {
				return false;
			}

			// For plan cancellations, require a valid selection from the adventure dropdown
			if ( ! isNextAdventureValid ) {
				return false;
			}

			return true;
		}

		return ! disableButtons && ! isSubmitting;
	};

	const renderStepButtons = () => {
		const {
			clickNext,
			onSubmit,
			closeDialog,
			onClickAccept,
			isSubmitting,
			surveyStep,
			solution,
			disableButtons,
			getAllSurveySteps,
			isApplyingOffer,
			offerApplyError,
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
						variant="primary"
						isBusy={ isCancelling }
						disabled={ ! canGoNext() }
						onClick={ onSubmit }
					>
						{ __( 'Submit' ) }
					</Button>
					<Button
						variant="secondary"
						isBusy={ isCancelling }
						disabled={ ! canGoNext() }
						onClick={ closeDialog }
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
						variant="primary"
						onClick={ () => {
							onClickAccept && onClickAccept();
						} }
						disabled={ isApplyingOffer ?? ( false || Boolean( offerApplyError ) ) ?? false }
						isBusy={ isApplyingOffer ?? false }
					>
						{ isApplyingOffer ?? false ? __( 'Getting Discount' ) : __( 'Get discount' ) }
					</Button>
				</ButtonStack>
			);
		}

		const variant = surveyStep !== UPSELL_STEP ? 'primary' : 'secondary';

		return (
			<Button
				variant={ variant }
				isBusy={ isCancelling }
				disabled={ ! canGoNext() }
				onClick={ onSubmit }
			>
				{ __( 'Submit' ) }
			</Button>
		);
	};

	// FIXME: find a way to determine these prices.
	props.downgradePlanToPersonalPrice = 0;
	props.downgradePlanToMonthlyPrice = 0;

	return (
		props.isVisible && (
			<>
				{ surveyContent() }

				{ renderStepButtons() }
			</>
		)
	);
}
