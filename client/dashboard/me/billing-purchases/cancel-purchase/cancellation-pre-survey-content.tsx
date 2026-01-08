import CancellationMainContent from './cancellation-main-content';
import DomainOptionsContent from './domain-options-content';
import type { CancelPurchaseState } from './types';
import type {
	Purchase,
	Domain,
	AtomicTransfer,
	UpgradesCancelFeaturesResponse,
} from '@automattic/api-core';

interface CancellationPreSurveyContentProps {
	purchase: Purchase;
	includedDomainPurchase?: Purchase;
	atomicTransfer?: AtomicTransfer;
	selectedDomain?: Domain;
	state: CancelPurchaseState;
	purchaseCancelFeatures?: UpgradesCancelFeaturesResponse;
	onCancelConfirmationStateChange: ( newState: Partial< CancelPurchaseState > ) => void;
	onDomainConfirmationChange: ( checked: boolean ) => void;
	onCustomerConfirmedUnderstandingChange: ( checked: boolean ) => void;
	onKeepSubscriptionClick: () => void;
	onCancellationComplete: () => void;
	onCancellationStart: () => void;
	shouldHandleMarketplaceSubscriptions: () => boolean;
	showMarketplaceDialog: () => void;
	flowType: string;
}

export default function CancellationPreSurveyContent( {
	purchase,
	includedDomainPurchase,
	atomicTransfer,
	selectedDomain,
	state,
	purchaseCancelFeatures,
	onCancelConfirmationStateChange,
	onDomainConfirmationChange,
	onCustomerConfirmedUnderstandingChange,
	onKeepSubscriptionClick,
	onCancellationComplete,
	onCancellationStart,
	shouldHandleMarketplaceSubscriptions,
	showMarketplaceDialog,
	flowType,
}: CancellationPreSurveyContentProps ) {
	return state.showDomainOptionsStep ? (
		<DomainOptionsContent
			purchase={ purchase }
			includedDomainPurchase={ includedDomainPurchase }
			atomicTransfer={ atomicTransfer }
			state={ state }
			onCancelConfirmationStateChange={ onCancelConfirmationStateChange }
			onKeepSubscriptionClick={ onKeepSubscriptionClick }
			onCancellationComplete={ onCancellationComplete }
			flowType={ flowType }
		/>
	) : (
		<CancellationMainContent
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
			flowType={ flowType }
			onCancelClick={
				shouldHandleMarketplaceSubscriptions() ? showMarketplaceDialog : onCancellationStart
			}
		/>
	);
}
