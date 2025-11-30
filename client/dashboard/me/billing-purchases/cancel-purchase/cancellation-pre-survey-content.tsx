import { __experimentalHeading as Heading } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
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
}: CancellationPreSurveyContentProps ) {
	return (
		<>
			<Heading level={ 4 }>
				{
					/* translators: %(purchaseName)s is the name of the product which was purchased */
					sprintf( __( 'Manage %(purchaseName)s' ), {
						purchaseName: purchase.is_domain ? purchase.meta : purchase.product_name,
					} )
				}
			</Heading>

			<p className="cancel-purchase__left">
				{ state.showDomainOptionsStep ? (
					<DomainOptionsContent
						purchase={ purchase }
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
						includedDomainPurchase={ includedDomainPurchase }
						atomicTransfer={ atomicTransfer }
						selectedDomain={ selectedDomain }
						state={ state }
						purchaseCancelFeatures={ purchaseCancelFeatures }
						onCancelConfirmationStateChange={ onCancelConfirmationStateChange }
						onDomainConfirmationChange={ onDomainConfirmationChange }
						onCustomerConfirmedUnderstandingChange={ onCustomerConfirmedUnderstandingChange }
						onKeepSubscriptionClick={ onKeepSubscriptionClick }
						onCancelClick={
							shouldHandleMarketplaceSubscriptions() ? showMarketplaceDialog : onCancellationStart
						}
					/>
				) }
			</p>
		</>
	);
}
