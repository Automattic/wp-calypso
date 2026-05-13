import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { DisplayVariant } from '../../../utils/purchase';
import { ATOMIC_REVERT_STEP } from './cancel-purchase-form/steps';
import { getButtonLabels } from './get-confirmation-copy';
import { useIsSplitCancelRemoveEnabled } from './use-is-split-cancel-remove-enabled';
import type { CancelPurchaseState } from './types';
import type { Purchase, AtomicTransfer } from '@automattic/api-core';

interface CancelButtonProps {
	purchase: Purchase;
	displayVariant: DisplayVariant;
	includedDomainPurchase?: Purchase;
	atomicTransfer?: AtomicTransfer;
	state: CancelPurchaseState;
	disabled?: boolean;
	isBusy?: boolean;
	onClick?: () => void;
}

export default function CancelButton( {
	purchase,
	displayVariant,
	includedDomainPurchase,
	atomicTransfer,
	state,
	disabled,
	isBusy,
	onClick,
}: CancelButtonProps ) {
	const isDomainRegistrationPurchase = purchase && purchase.is_domain_registration;
	const isSplitEnabled = useIsSplitCancelRemoveEnabled();

	// Check if we need atomic revert confirmation
	const needsAtomicRevertConfirmation = atomicTransfer?.created_at;

	const isDisabled =
		disabled ||
		( state.cancelBundledDomain && ! state.confirmCancelBundledDomain ) ||
		( state.surveyStep === ATOMIC_REVERT_STEP &&
			needsAtomicRevertConfirmation &&
			! state.atomicRevertConfirmed &&
			purchase.is_plan ) ||
		( ! isSplitEnabled && isDomainRegistrationPurchase && ! state.domainConfirmationConfirmed ) ||
		( ! state.showDomainOptionsStep && ! state.customerConfirmedUnderstanding );

	const cancelButtonText = includedDomainPurchase
		? __( 'Continue with cancellation' )
		: getButtonLabels( {
				purchase,
				intent: displayVariant === 'remove' ? 'remove' : 'cancel',
		  } ).primary;

	return (
		<Button
			className="cancel-purchase__cancel-button"
			disabled={ isDisabled }
			isBusy={ isBusy ?? state.isLoading ?? false }
			onClick={ onClick }
			isDestructive
			variant="primary"
		>
			{ cancelButtonText }
		</Button>
	);
}
