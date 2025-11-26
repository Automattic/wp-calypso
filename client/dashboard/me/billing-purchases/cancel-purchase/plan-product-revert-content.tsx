import { ButtonStack } from '../../../components/button-stack';
import CancelButton from './cancel-button';
import CancellationFullText from './cancellation-full-text';
import ConfirmCheckbox from './confirm-checkbox';
import KeepSubscriptionButton from './keep-subscription-button';
import type { CancelPurchaseState } from './types';
import type { Purchase, AtomicTransfer } from '@automattic/api-core';

interface PlanProductRevertContentProps {
	purchase: Purchase;
	includedDomainPurchase?: Purchase;
	atomicTransfer?: AtomicTransfer;
	state: CancelPurchaseState;
	onDomainConfirmationChange: ( checked: boolean ) => void;
	onCustomerConfirmedUnderstandingChange: ( checked: boolean ) => void;
	onKeepSubscriptionClick: () => void;
	onCancelClick?: () => void;
}

export default function PlanProductRevertContent( {
	purchase,
	includedDomainPurchase,
	atomicTransfer,
	state,
	onDomainConfirmationChange,
	onCustomerConfirmedUnderstandingChange,
	onKeepSubscriptionClick,
	onCancelClick,
}: PlanProductRevertContentProps ) {
	return (
		<>
			{ ! includedDomainPurchase && (
				<p>
					<CancellationFullText
						purchase={ purchase }
						cancelBundledDomain={ state.cancelBundledDomain ?? false }
						includedDomainPurchase={ includedDomainPurchase }
					/>
				</p>
			) }

			{ ! state.surveyShown && (
				<ConfirmCheckbox
					purchase={ purchase }
					atomicTransfer={ atomicTransfer }
					state={ state }
					onDomainConfirmationChange={ onDomainConfirmationChange }
					onCustomerConfirmedUnderstandingChange={ onCustomerConfirmedUnderstandingChange }
				/>
			) }

			<ButtonStack>
				<CancelButton
					purchase={ purchase }
					includedDomainPurchase={ includedDomainPurchase }
					atomicTransfer={ atomicTransfer }
					state={ state }
					onClick={ onCancelClick }
				/>
				<KeepSubscriptionButton
					purchase={ purchase }
					onKeepSubscriptionClick={ onKeepSubscriptionClick }
				/>
			</ButtonStack>
		</>
	);
}
