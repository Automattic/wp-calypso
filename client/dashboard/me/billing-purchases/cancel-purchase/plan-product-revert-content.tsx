import { __experimentalVStack as VStack } from '@wordpress/components';
import { ButtonStack } from '../../../components/button-stack';
import { Text } from '../../../components/text';
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
	flowType: string;
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
	flowType,
}: PlanProductRevertContentProps ) {
	return (
		<VStack spacing={ 6 }>
			{ ! includedDomainPurchase && flowType !== 'remove' && (
				<Text>
					<CancellationFullText
						purchase={ purchase }
						cancelBundledDomain={ state.cancelBundledDomain ?? false }
						includedDomainPurchase={ includedDomainPurchase }
					/>
				</Text>
			) }

			{ ! state.surveyShown && (
				<ConfirmCheckbox
					purchase={ purchase }
					atomicTransfer={ atomicTransfer }
					state={ state }
					onDomainConfirmationChange={ onDomainConfirmationChange }
					onCustomerConfirmedUnderstandingChange={ onCustomerConfirmedUnderstandingChange }
					flowType={ flowType }
				/>
			) }

			<ButtonStack justify="flex-start">
				<CancelButton
					purchase={ purchase }
					includedDomainPurchase={ includedDomainPurchase }
					atomicTransfer={ atomicTransfer }
					state={ state }
					onClick={ onCancelClick }
					flowType={ flowType }
				/>
				<KeepSubscriptionButton
					purchase={ purchase }
					onKeepSubscriptionClick={ onKeepSubscriptionClick }
				/>
			</ButtonStack>
		</VStack>
	);
}
