import { formatCurrency } from '@automattic/number-formatters';
import { __, sprintf } from '@wordpress/i18n';
import { useIntlLocale } from '../../../app/locale';
import ConfirmModal from '../../../components/confirm-modal';
import { getTitanTierName } from '../../utils/titan-tiers';
import type { TitanDowngradeMode } from '../../hooks/use-titan-downgrade';
import type { TitanPlanTier } from '../../types';

export interface PendingTitanDowngrade {
	tier: TitanPlanTier;
	toProductId: number;
}

export function TitanDowngradeModal( {
	pendingDowngrade,
	currentTier,
	mode,
	refundAmount,
	currencyCode,
	renewDate,
	isBusy,
	onCancel,
	onConfirm,
}: {
	pendingDowngrade: PendingTitanDowngrade | null;
	currentTier: TitanPlanTier;
	mode: TitanDowngradeMode;
	/** Refund for this target, in the currency's main unit. Zero when none applies. */
	refundAmount: number;
	currencyCode: string;
	/** ISO date of the next renewal, when one is scheduled. */
	renewDate?: string;
	isBusy: boolean;
	onCancel: () => void;
	onConfirm: () => void;
} ) {
	const locale = useIntlLocale();

	if ( ! pendingDowngrade ) {
		return null;
	}

	const currentPlanName = getTitanTierName( currentTier );
	const targetPlanName = getTitanTierName( pendingDowngrade.tier );
	const isInstant = mode === 'instant';
	const refundText =
		refundAmount > 0 ? formatCurrency( refundAmount, currencyCode, { stripZeros: true } ) : null;
	const renewalDate = renewDate
		? new Intl.DateTimeFormat( locale, { dateStyle: 'long' } ).format( new Date( renewDate ) )
		: null;

	// Each message states what happens to the customer's money.
	const description = ( () => {
		if ( isInstant ) {
			return refundText
				? sprintf(
						/* translators: %1$s is the current email plan name, %2$s the plan being switched to, %3$s a refunded amount such as "$18.00". */
						__(
							'Your plan will change from %1$s to %2$s right away, and you will be refunded %3$s.'
						),
						currentPlanName,
						targetPlanName,
						refundText
				  )
				: sprintf(
						/* translators: %1$s is the current email plan name, %2$s the plan being switched to. */
						__( 'Your plan will change from %1$s to %2$s right away.' ),
						currentPlanName,
						targetPlanName
				  );
		}

		return renewalDate
			? sprintf(
					/* translators: %1$s is the current email plan name, %2$s the plan being switched to, %3$s a date such as "January 1, 2026". */
					__(
						'Your plan will change from %1$s to %2$s at your next renewal on %3$s. Until then you keep %1$s, and no refund or credit is issued.'
					),
					currentPlanName,
					targetPlanName,
					renewalDate
			  )
			: sprintf(
					/* translators: %1$s is the current email plan name, %2$s the plan being switched to. */
					__(
						'Your plan will change from %1$s to %2$s at your next renewal. Until then you keep %1$s, and no refund or credit is issued.'
					),
					currentPlanName,
					targetPlanName
			  );
	} )();

	const confirmLabel =
		isInstant && refundText
			? sprintf(
					/* translators: %s is a refunded amount, e.g. "$18.00". */
					__( 'Change plan and refund %s' ),
					refundText
			  )
			: __( 'Change plan' );

	return (
		<ConfirmModal
			isOpen
			__experimentalHideHeader={ false }
			title={ isInstant ? __( 'Change your plan' ) : __( 'Schedule your plan change' ) }
			cancelButtonText={ __( 'Keep current plan' ) }
			confirmButtonProps={ { label: confirmLabel, isBusy, disabled: isBusy } }
			onCancel={ onCancel }
			onConfirm={ onConfirm }
		>
			{ description }
		</ConfirmModal>
	);
}
