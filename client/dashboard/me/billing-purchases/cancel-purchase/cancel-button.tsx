import config from '@automattic/calypso-config';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { DisplayVariant } from '../../../utils/purchase';
import { ATOMIC_REVERT_STEP } from './cancel-purchase-form/steps';
import { getButtonLabels } from './get-confirmation-copy';
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
	skipSurvey?: boolean;
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
	skipSurvey,
	onClick,
}: CancelButtonProps ) {
	const isDomainRegistrationPurchase = purchase && purchase.is_domain_registration;
	const isSplitEnabled = config.isEnabled( 'purchases/split-cancel-remove' );

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

	const isLoading = isBusy ?? state.isLoading ?? false;
	const cancelButtonText = includedDomainPurchase
		? __( 'Continue with cancellation' )
		: getButtonLabels( {
				purchase,
				intent: displayVariant === 'remove' ? 'remove' : 'cancel',
				skipSurvey,
		  } ).primary;

	return (
		<Button
			disabled={ isDisabled || isLoading }
			isBusy={ isLoading }
			onClick={ onClick }
			isDestructive
			variant="primary"
		>
			{ cancelButtonText }
		</Button>
	);
}
