import { ButtonStack } from '../../../components/button-stack';
import { isNonDomainSubscription } from '../../../utils/purchase';
import CancelButton from './cancel-button';
import CancelPurchaseDomainOptions from './domain-options';
import KeepSubscriptionButton from './keep-subscription-button';
import type { CancelPurchaseState } from './types';
import type { Purchase, AtomicTransfer } from '@automattic/api-core';

interface DomainOptionsContentProps {
	purchase: Purchase;
	includedDomainPurchase?: Purchase;
	atomicTransfer?: AtomicTransfer;
	state: CancelPurchaseState;
	onCancelConfirmationStateChange: ( newState: Partial< CancelPurchaseState > ) => void;
	onKeepSubscriptionClick: () => void;
	onCancellationComplete: () => void;
}

export default function DomainOptionsContent( {
	purchase,
	includedDomainPurchase,
	atomicTransfer,
	state,
	onCancelConfirmationStateChange,
	onKeepSubscriptionClick,
	onCancellationComplete,
}: DomainOptionsContentProps ) {
	const { cancelBundledDomain, confirmCancelBundledDomain } = state;

	if ( ! includedDomainPurchase || ! isNonDomainSubscription( purchase ) ) {
		return null;
	}

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
			<ButtonStack justify="flex-start">
				<CancelButton
					purchase={ purchase }
					includedDomainPurchase={ includedDomainPurchase }
					atomicTransfer={ atomicTransfer }
					state={ state }
					disabled={ ! canContinue() }
					onClick={ () => {
						onCancellationComplete();
					} }
				/>
				<KeepSubscriptionButton
					purchase={ purchase }
					onKeepSubscriptionClick={ onKeepSubscriptionClick }
				/>
			</ButtonStack>
		</>
	);
}
