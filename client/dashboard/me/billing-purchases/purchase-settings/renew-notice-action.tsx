import { SubscriptionBillPeriod } from '@automattic/api-core';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { changePaymentMethodRoute } from '../../../app/router/me';
import { isCloseToExpiration, isInExpirationGracePeriod } from '../../../utils/purchase';
import type { Purchase } from '@automattic/api-core';

/**
 * Used to determine if we should render RenewNoticeAction.
 */
export function shouldShowRenewNoticeAction( purchase: Purchase ): boolean {
	// If the purchase is fully removed, do not show any actions. Such a
	// subscription cannot be renewed; it would have to be purchased again.
	// However, a purchase can be expired without being removed, and those
	// purchases can be renewed so we want to allow that case.
	if ( purchase.subscription_status !== 'active' ) {
		return false;
	}

	const shouldAddPaymentSourceInsteadOfRenewingNow =
		isCloseToExpiration( purchase ) ||
		purchase.bill_period_days === SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD;
	if (
		! purchase.payment_type &&
		( ! purchase.can_explicit_renew || shouldAddPaymentSourceInsteadOfRenewingNow )
	) {
		return true;
	}

	// isExpiring(), which leads here (along with isExpired()) returns true
	// when expiring, when auto-renew is disabled, or when the payment method
	// was credits but we don't want to show "Add Payment Method" if the
	// subscription is actually expiring or expired; we want to show "Renew
	// Now" in that case.
	if ( purchase.payment_type === 'credits' && purchase.expiry_status === 'manual-renew' ) {
		return true;
	}

	if ( ! purchase.is_rechargeable ) {
		return true;
	}

	// Show renew action for purchases in grace period that can be renewed.
	if ( purchase.can_explicit_renew && isInExpirationGracePeriod( purchase ) ) {
		return true;
	}

	return false;
}

/**
 * Render the action button in ExpiredRenewNotice or PurchaseExpiringNotice
 *
 * IMPORTANT: call shouldShowRenewNoticeAction before rendering this. Otherwise
 * there will be a space left for a button in the notice and nothing will be
 * rendered there.
 */
export function RenewNoticeAction( {
	onClick,
	purchase,
}: {
	purchase: Purchase;
	onClick: () => void;
} ) {
	const navigate = useNavigate();
	const shouldAddPaymentSourceInsteadOfRenewingNow =
		isCloseToExpiration( purchase ) ||
		purchase.bill_period_days === SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD;
	if (
		! purchase.payment_type &&
		( ! purchase.can_explicit_renew || shouldAddPaymentSourceInsteadOfRenewingNow )
	) {
		return (
			<Button
				variant="primary"
				onClick={ () => {
					navigate( {
						to: changePaymentMethodRoute.fullPath,
						params: { purchaseId: purchase.ID },
					} );
				} }
			>
				{ __( 'Add payment method' ) }
			</Button>
		);
	}

	// isExpiring(), which leads here (along with isExpired()) returns true
	// when expiring, when auto-renew is disabled, or when the payment method
	// was credits but we don't want to show "Add Payment Method" if the
	// subscription is actually expiring or expired; we want to show "Renew
	// Now" in that case.
	if ( purchase.payment_type === 'credits' && purchase.expiry_status === 'manual-renew' ) {
		return (
			<Button
				variant="primary"
				onClick={ () => {
					navigate( {
						to: changePaymentMethodRoute.fullPath,
						params: { purchaseId: purchase.ID },
					} );
				} }
			>
				{ __( 'Add payment method' ) }
			</Button>
		);
	}

	return (
		<Button variant="primary" onClick={ onClick }>
			{ __( 'Renew now' ) }
		</Button>
	);
}
