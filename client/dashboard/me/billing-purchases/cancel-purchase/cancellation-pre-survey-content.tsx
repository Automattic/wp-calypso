import { DisplayVariant } from '../../../utils/purchase';
import CancellationMainContent from './cancellation-main-content';
import DomainOptionsContent from './domain-options-content';
import type { CancelPurchaseState } from './types';
import type {
	Purchase,
	Domain,
	AtomicTransfer,
	Site,
	UpgradesCancelFeaturesResponse,
} from '@automattic/api-core';

interface CancellationPreSurveyContentProps {
	purchase: Purchase;
	displayVariant: DisplayVariant;
	includedDomainPurchase?: Purchase;
	atomicTransfer?: AtomicTransfer;
	selectedDomain?: Domain;
	site?: Site;
	wpcomDomain?: string | null;
	activeMarketplaceSubscriptions?: Purchase[];
	state: CancelPurchaseState;
	purchaseCancelFeatures?: UpgradesCancelFeaturesResponse;
	isBusy?: boolean;
	onCancelConfirmationStateChange: ( newState: Partial< CancelPurchaseState > ) => void;
	onDomainConfirmationChange: ( checked: boolean ) => void;
	onCustomerConfirmedUnderstandingChange: ( checked: boolean ) => void;
	onCustomerConfirmedUnderstandingAtomicPlanRevert: ( checked: boolean ) => void;
	onKeepSubscriptionClick: () => void;
	onCancellationComplete: () => void;
	onCancellationStart: () => void;
	shouldHandleMarketplaceSubscriptions: () => boolean;
	showMarketplaceDialog: () => void;
}

export default function CancellationPreSurveyContent( {
	purchase,
	displayVariant,
	includedDomainPurchase,
	atomicTransfer,
	selectedDomain,
	site,
	wpcomDomain,
	activeMarketplaceSubscriptions,
	state,
	purchaseCancelFeatures,
	isBusy,
	onCancelConfirmationStateChange,
	onDomainConfirmationChange,
	onCustomerConfirmedUnderstandingChange,
	onCustomerConfirmedUnderstandingAtomicPlanRevert,
	onKeepSubscriptionClick,
	onCancellationComplete,
	onCancellationStart,
	shouldHandleMarketplaceSubscriptions,
	showMarketplaceDialog,
}: CancellationPreSurveyContentProps ) {
	return state.showDomainOptionsStep ? (
		<DomainOptionsContent
			purchase={ purchase }
			displayVariant={ displayVariant }
			includedDomainPurchase={ includedDomainPurchase }
			atomicTransfer={ atomicTransfer }
			state={ state }
			onCancelConfirmationStateChange={ onCancelConfirmationStateChange }
			onKeepSubscriptionClick={ onKeepSubscriptionClick }
			onCancellationComplete={ onCancellationComplete }
		/>
	) : (
		<CancellationMainContent
			purchase={ purchase }
			displayVariant={ displayVariant }
			includedDomainPurchase={ includedDomainPurchase }
			atomicTransfer={ atomicTransfer }
			selectedDomain={ selectedDomain }
			site={ site }
			wpcomDomain={ wpcomDomain }
			activeMarketplaceSubscriptions={ activeMarketplaceSubscriptions }
			state={ state }
			purchaseCancelFeatures={ purchaseCancelFeatures }
			isBusy={ isBusy }
			onCancelConfirmationStateChange={ onCancelConfirmationStateChange }
			onDomainConfirmationChange={ onDomainConfirmationChange }
			onCustomerConfirmedUnderstandingChange={ onCustomerConfirmedUnderstandingChange }
			onCustomerConfirmedUnderstandingAtomicPlanRevert={
				onCustomerConfirmedUnderstandingAtomicPlanRevert
			}
			onKeepSubscriptionClick={ onKeepSubscriptionClick }
			onCancelClick={
				shouldHandleMarketplaceSubscriptions() ? showMarketplaceDialog : onCancellationStart
			}
		/>
	);
}
