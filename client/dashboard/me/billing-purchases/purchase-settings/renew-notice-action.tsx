import { SubscriptionBillPeriod } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import { changePaymentMethodRoute } from '../../../app/router/me';
import { NoticeActionButton, RouterNoticeActionLinkButton } from '../../../components/notice';
import { isCloseToExpiration, isExpiredAndInGracePeriod, isRemoved } from '../../../utils/purchase';
import type { Purchase } from '@automattic/api-core';

/**
 * Used to determine if we should render RenewNoticeAction.
 */
export function shouldShowRenewNoticeAction( purchase: Purchase ): boolean {
	// If the purchase is fully removed, do not show any actions. Such a
	// subscription cannot be renewed; it would have to be purchased again.
	if ( isRemoved( purchase ) ) {
		return false;
	}

	// When the purchase is close to expiration and has no payment method or
	// can't be renewed, we should show an "Add Payment Method" action.
	const shouldAddPaymentSourceInsteadOfRenewingNow =
		isCloseToExpiration( purchase ) ||
		purchase.bill_period_days === SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD;
	if (
		! purchase.payment_type &&
		( ! purchase.can_explicit_renew || shouldAddPaymentSourceInsteadOfRenewingNow )
	) {
		return true;
	}

	// When the purchase is far away from expiration but was paid for with
	// credits, we should show an "Add Payment Method" action too.
	if ( purchase.payment_type === 'credits' && purchase.expiry_status === 'manual-renew' ) {
		return true;
	}

	if ( ! purchase.is_rechargeable ) {
		return true;
	}

	// When the purchase is past its expiration date, we always want to show
	// "Renew now" if it's possible to renew.
	if ( purchase.can_explicit_renew && isExpiredAndInGracePeriod( purchase ) ) {
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
	// When the purchase is close to expiration and has no payment method or
	// can't be renewed, we should show an "Add Payment Method" action.
	const shouldAddPaymentSourceInsteadOfRenewingNow =
		isCloseToExpiration( purchase ) ||
		purchase.bill_period_days === SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD;
	if (
		( ! purchase.payment_type &&
			( ! purchase.can_explicit_renew || shouldAddPaymentSourceInsteadOfRenewingNow ) ) ||
		// When the purchase is far away from expiration but was paid for with
		// credits, we should show an "Add Payment Method" action too.
		( purchase.payment_type === 'credits' && purchase.expiry_status === 'manual-renew' )
	) {
		return (
			<RouterNoticeActionLinkButton
				variant="solid"
				to={ changePaymentMethodRoute.fullPath }
				params={ { purchaseId: purchase.ID } }
			>
				{ __( 'Add payment method' ) }
			</RouterNoticeActionLinkButton>
		);
	}

	return (
		<NoticeActionButton variant="solid" onClick={ onClick }>
			{ __( 'Renew now' ) }
		</NoticeActionButton>
	);
}
