import { SubscriptionBillPeriod } from '@automattic/api-core';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { isCloseToExpiration } from '../../../utils/purchase';
import type { Purchase } from '@automattic/api-core';

/**
 * Used to determine if we should render RenewNoticeAction.
 */
export function shouldShowRenewNoticeAction( purchase: Purchase ): boolean {
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

	if ( ! purchase.is_rechargable ) {
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
	const siteSlug = purchase.site_slug ?? purchase.blog_id;
	const changePaymentMethodPath = purchase.payment_card_id
		? `/me/purchases/${ siteSlug }/${ purchase.ID }/payment-method/change/${ purchase.payment_card_id }`
		: `/me/purchases/${ siteSlug }/${ purchase.ID }/payment-method/add`;
	const shouldAddPaymentSourceInsteadOfRenewingNow =
		isCloseToExpiration( purchase ) ||
		purchase.bill_period_days === SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD;
	if (
		! purchase.payment_type &&
		( ! purchase.can_explicit_renew || shouldAddPaymentSourceInsteadOfRenewingNow )
	) {
		return (
			<Button variant="primary" href={ changePaymentMethodPath }>
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
			<Button variant="primary" href={ changePaymentMethodPath }>
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
