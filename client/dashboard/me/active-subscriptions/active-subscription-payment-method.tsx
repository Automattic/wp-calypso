import { __ } from '@wordpress/i18n';
import { isAutoRenewEnabled, isExpired, isRenewing, isAkismetFreeProduct } from './util';
import type { ActiveSubscription } from '../../data/me-active-subscriptions';

function getAddPaymentMethodUrlFor( purchase: ActiveSubscription ): string {
	// FIXME: do this
	return `/me/purchases/${ purchase.site_slug ?? 'unknown' }/${ purchase.ID }/payment-method/add`;
}

export function ActiveSubscriptionPaymentMethod( {
	purchase,
	isDisconnectedSite,
}: {
	purchase: ActiveSubscription;
	isDisconnectedSite?: boolean;
} ) {
	if ( purchase.expiry_status === 'included' ) {
		return __( 'Included with Plan' );
	}

	if ( purchase.is_iap_purchase ) {
		return (
			<div>
				<span>{ __( 'In-App Purchase' ) }</span>
			</div>
		);
	}

	if (
		( isAutoRenewEnabled( purchase ),
		! isExpired( purchase ) &&
			( ! purchase.payment_type || purchase.payment_type === 'credits' ) &&
			! purchase.partner_name &&
			! isAkismetFreeProduct( purchase ) ) &&
		! isDisconnectedSite
	) {
		return (
			<div className="purchase-item__no-payment-method">
				<a href={ getAddPaymentMethodUrlFor( purchase ) }>{ __( 'Add payment method' ) }</a>
			</div>
		);
	}

	if (
		! isAkismetFreeProduct( purchase ) &&
		! purchase.is_rechargable &&
		isAutoRenewEnabled( purchase )
	) {
		return (
			<div className="purchase-item__no-payment-method">
				<span>{ __( 'You don’t have a payment method to renew this subscription' ) }</span>
			</div>
		);
	}

	if ( isRenewing( purchase ) ) {
		if ( purchase.payment_type === 'credit_card' && purchase.payment_card_id ) {
			const paymentMethodType = purchase.payment_card_display_brand
				? purchase.payment_card_display_brand
				: purchase.payment_card_type || purchase.payment_card_processor || '';

			// FIXME: show icon for paymentMethodType
			return (
				<>
					{ paymentMethodType }: { purchase.payment_details }
				</>
			);
		}

		if ( purchase.payment_type === 'paypal' ) {
			// FIXME: show paypal image
			return <p>PayPal</p>;
		}

		if ( purchase.payment_type === 'upi' ) {
			// FIXME: show upi image
			return <p>Razorpay</p>;
		}

		return null;
	}
}
