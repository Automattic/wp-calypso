import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	hasAmountAvailableToRefund,
	isNonDomainSubscription,
	isOneTimePurchase,
} from '../../../utils/purchase';
import { ATOMIC_REVERT_STEP } from './cancel-purchase-form/steps';
import type { CancelPurchaseState } from './types';
import type { Purchase, AtomicTransfer } from '@automattic/api-core';

interface CancelButtonProps {
	purchase: Purchase;
	includedDomainPurchase?: Purchase;
	atomicTransfer?: AtomicTransfer;
	state: CancelPurchaseState;
	disabled?: boolean;
	isBusy?: boolean;
	onClick?: () => void;
}

export default function CancelButton( {
	purchase,
	includedDomainPurchase,
	atomicTransfer,
	state,
	disabled,
	isBusy,
	onClick,
}: CancelButtonProps ) {
	const isDomainRegistrationPurchase = purchase && purchase.is_domain_registration;

	// Check if we need atomic revert confirmation
	const needsAtomicRevertConfirmation = atomicTransfer?.created_at;

	const isDisabled =
		disabled ||
		( state.cancelBundledDomain && ! state.confirmCancelBundledDomain ) ||
		( state.surveyStep === ATOMIC_REVERT_STEP &&
			needsAtomicRevertConfirmation &&
			! state.atomicRevertConfirmed &&
			purchase.is_plan ) ||
		( isDomainRegistrationPurchase && ! state.domainConfirmationConfirmed ) ||
		! ( state?.customerConfirmedUnderstanding || false );

	const cancelButtonText = ( () => {
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
		<Button
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
