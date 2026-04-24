import { __experimentalVStack as VStack } from '@wordpress/components';
import { ButtonStack } from '../../../components/button-stack';
import { DisplayVariant } from '../../../utils/purchase';
import CancelButton from './cancel-button';
import ConfirmCheckbox from './confirm-checkbox';
import KeepSubscriptionButton from './keep-subscription-button';
import type { CancelPurchaseState } from './types';
import type { Purchase, AtomicTransfer } from '@automattic/api-core';

interface PlanProductRevertContentProps {
	purchase: Purchase;
	displayVariant: DisplayVariant;
	includedDomainPurchase?: Purchase;
	atomicTransfer?: AtomicTransfer;
	state: CancelPurchaseState;
	skipSurvey?: boolean;
	onDomainConfirmationChange: ( checked: boolean ) => void;
	onCustomerConfirmedUnderstandingChange: ( checked: boolean ) => void;
	onCustomerConfirmedUnderstandingAtomicPlanRevert: ( checked: boolean ) => void;
	onKeepSubscriptionClick: () => void;
	onCancelClick?: () => void;
}

export default function PlanProductRevertContent( {
	purchase,
	displayVariant,
	includedDomainPurchase,
	atomicTransfer,
	state,
	skipSurvey,
	onDomainConfirmationChange,
	onCustomerConfirmedUnderstandingChange,
	onCustomerConfirmedUnderstandingAtomicPlanRevert,
	onKeepSubscriptionClick,
	onCancelClick,
}: PlanProductRevertContentProps ) {
	return (
		<VStack spacing={ 6 }>
			{ ! state.surveyShown && (
				<ConfirmCheckbox
					purchase={ purchase }
					displayVariant={ displayVariant }
					atomicTransfer={ atomicTransfer }
					disabled={ state.isLoading }
					state={ state }
					onDomainConfirmationChange={ onDomainConfirmationChange }
					onCustomerConfirmedUnderstandingChange={ onCustomerConfirmedUnderstandingChange }
					onCustomerConfirmedUnderstandingAtomicPlanRevert={
						onCustomerConfirmedUnderstandingAtomicPlanRevert
					}
				/>
			) }

			<ButtonStack justify="flex-start">
				<CancelButton
					purchase={ purchase }
					displayVariant={ displayVariant }
					includedDomainPurchase={ includedDomainPurchase }
					atomicTransfer={ atomicTransfer }
					state={ state }
					skipSurvey={ skipSurvey }
					onClick={ onCancelClick }
				/>
				<KeepSubscriptionButton
					purchase={ purchase }
					intent={ displayVariant }
					disabled={ state.isLoading }
					onKeepSubscriptionClick={ onKeepSubscriptionClick }
				/>
			</ButtonStack>
		</VStack>
	);
}
