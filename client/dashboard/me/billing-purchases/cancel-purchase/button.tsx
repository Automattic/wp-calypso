import { purchaseQuery, siteByIdQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { cancelPurchaseRoute } from '../../../app/router/me';
import {
	getPurchaseCancellationFlowType,
	isNonDomainSubscription,
	hasAmountAvailableToRefund,
	isOneTimePurchase,
} from '../../../utils/purchase';
import CancelPurchaseForm from './cancel-purchase-form';
import MarketPlaceSubscriptionsDialog from './marketplace-subscriptions-dialog';
import type { CancelPurchaseFormProps } from './cancel-purchase-form';
import type { Purchase } from '@automattic/api-core';

interface CancelPurchaseButtonProps extends CancelPurchaseFormProps {
	activeSubscriptions: Purchase[];
	closeMarketplaceSubscriptionsDialog: () => void;
	disabled?: boolean;
	isAkismet: boolean;
	isJetpack: boolean;
	isLoading: boolean;
	offerDiscountBasedFromPurchasePrice?: number | undefined;
	onCancellationComplete: () => void;
	onCancellationStart?: ( () => void ) | undefined;
	onDialogClose: () => void;
	onSetLoading: ( isLoading: boolean ) => void;
	showMarketplaceDialog?: ( () => void ) | undefined;
	shouldShowMarketplaceDialog?: boolean; // Control marketplace dialog visibility
}

export default function CancelPurchaseButton( props: CancelPurchaseButtonProps ) {
	const { purchaseId } = cancelPurchaseRoute.useParams();
	const { data: purchase } = useSuspenseQuery( purchaseQuery( parseInt( purchaseId ) ) );
	const { data: site } = useSuspenseQuery( siteByIdQuery( purchase.blog_id ) );
	const {
		activeSubscriptions,
		closeMarketplaceSubscriptionsDialog,
		isLoading,
		onCancellationComplete,
		onCancellationStart,
		shouldShowMarketplaceDialog,
		showMarketplaceDialog,
	} = props;
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

	const handleSurveyComplete = () => {
		// Call the parent's survey complete handler
		if ( props.onSurveyComplete ) {
			props.onSurveyComplete();
		}
	};

	const { cancelBundledDomain, includedDomainPurchase } = props;

	const onClick = handleCancelPurchaseClick;

	const disableButtons = props?.disabled ?? false;

	const shouldHandleMarketplaceSubscriptions = () => {
		const { activeSubscriptions, shouldShowMarketplaceDialog } = props;
		return activeSubscriptions?.length > 0 && ( shouldShowMarketplaceDialog ?? true );
	};

	const planName = purchase.is_domain_registration ? purchase.meta : purchase.product_name;
	const {
		atomicRevertCheckOne,
		atomicRevertCheckTwo,
		atomicRevertOnClickCheckOne,
		atomicRevertOnClickCheckTwo,
		clickNext,
		closeDialog,
		currentPlan,
		getAllSurveySteps,
		importQuestionRadio,
		isNextAdventureValid,
		isSubmitting,
		offerDiscountBasedFromPurchasePrice,
		onClickAccept,
		onImportRadioChange,
		onNextAdventureValidationChange,
		onRadioOneChange,
		onRadioTwoChange,
		onSubmit,
		onTextOneChange,
		onTextThreeChange,
		onTextTwoChange,
		plans,
		purchases,
		questionOneRadio,
		questionOneText,
		questionTwoOrder,
		questionTwoRadio,
		questionTwoText,
		refundAmount,
		sitePlans,
		sitePurchases,
		solution,
		surveyStep,
		upsell,
	} = props;

	const text = ( () => {
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
		<>
			<div className="cancel-purchase__button-wrapper">
				{ ! shouldShowMarketplaceDialog && (
					<Button
						className="cancel-purchase__button"
						disabled={ disableButtons }
						isBusy={ isLoading ?? false }
						onClick={ shouldHandleMarketplaceSubscriptions() ? showMarketplaceDialog : onClick }
						variant="primary"
					>
						{ text }
					</Button>
				) }
				<CancelPurchaseForm
					atomicRevertCheckOne={ atomicRevertCheckOne }
					atomicRevertCheckTwo={ atomicRevertCheckTwo }
					atomicRevertOnClickCheckOne={ atomicRevertOnClickCheckOne }
					atomicRevertOnClickCheckTwo={ atomicRevertOnClickCheckTwo }
					cancelBundledDomain={ cancelBundledDomain }
					cancellationInProgress={ isLoading }
					clickNext={ clickNext }
					closeDialog={ closeDialog }
					currentPlan={ currentPlan }
					disableButtons={ disableButtons }
					downgradeClick={ props.downgradeClick }
					flowType={ getPurchaseCancellationFlowType( purchase ) }
					freeMonthOfferClick={ props.freeMonthOfferClick }
					getAllSurveySteps={ getAllSurveySteps }
					importQuestionRadio={ importQuestionRadio }
					includedDomainPurchase={ includedDomainPurchase }
					isNextAdventureValid={ isNextAdventureValid }
					isSubmitting={ isSubmitting }
					isVisible={ shouldShowMarketplaceDialog }
					offerDiscountBasedFromPurchasePrice={ offerDiscountBasedFromPurchasePrice }
					onClose={ closeDialog }
					onClickAccept={ onClickAccept }
					onImportRadioChange={ onImportRadioChange }
					onNextAdventureValidationChange={ onNextAdventureValidationChange }
					onRadioOneChange={ onRadioOneChange }
					onRadioTwoChange={ onRadioTwoChange }
					onSubmit={ onSubmit }
					onSurveyComplete={ handleSurveyComplete }
					onTextOneChange={ onTextOneChange }
					onTextThreeChange={ onTextThreeChange }
					onTextTwoChange={ onTextTwoChange }
					plans={ plans }
					purchase={ purchase }
					purchases={ purchases }
					questionOneRadio={ questionOneRadio }
					questionOneText={ questionOneText }
					questionTwoOrder={ questionTwoOrder }
					questionTwoRadio={ questionTwoRadio }
					questionTwoText={ questionTwoText }
					refundAmount={ refundAmount }
					site={ site }
					sitePlans={ sitePlans }
					sitePurchases={ sitePurchases }
					solution={ solution }
					surveyStep={ surveyStep }
					upsell={ upsell }
				/>
				{ shouldHandleMarketplaceSubscriptions() && (
					<MarketPlaceSubscriptionsDialog
						isDialogVisible={ shouldShowMarketplaceDialog ?? false }
						closeDialog={ closeMarketplaceSubscriptionsDialog }
						removePlan={ handleMarketplaceDialogContinue }
						planName={ planName }
						activeSubscriptions={ activeSubscriptions }
						// Translators: %(plan)s is the name of the plan being cancelled
						sectionHeadingText={ sprintf( __( 'Cancel %(plan)s' ), {
							plan: planName,
						} ) }
						// Translators: This button cancels the active plan and all active Marketplace subscriptions on the site
						primaryButtonText={ __( 'Continue' ) }
						bodyParagraphText={ _n(
							'This subscription will be cancelled. It will be removed when it expires.',
							'These subscriptions will be cancelled. They will be removed when they expire.',
							activeSubscriptions.length
						) }
					/>
				) }
			</div>
		</>
	);
}
