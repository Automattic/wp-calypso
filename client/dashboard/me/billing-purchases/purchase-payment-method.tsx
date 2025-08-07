import { __ } from '@wordpress/i18n';
import {
	isAutoRenewEnabled,
	isExpired,
	isRenewing,
	isAkismetFreeProduct,
} from '../../utils/purchase';
import { PaymentMethodImage } from './payment-method-image';
import type { Purchase } from '../../data/purchase';

export function PurchasePaymentMethod( {
	purchase,
	isDisconnectedSite,
	getAddPaymentMethodUrlFor,
}: {
	purchase: Purchase;
	isDisconnectedSite?: boolean;
	getAddPaymentMethodUrlFor: ( purchase: Purchase ) => string;
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
			<div>
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
			<div>
				<span>{ __( 'You don’t have a payment method to renew this subscription' ) }</span>
			</div>
		);
	}

	if ( isRenewing( purchase ) ) {
		if ( purchase.payment_type === 'credit_card' && purchase.payment_card_id ) {
			const paymentMethodType = purchase.payment_card_display_brand
				? purchase.payment_card_display_brand
				: purchase.payment_card_type || purchase.payment_card_processor || '';

			return (
				<>
					<PaymentMethodImage paymentMethodType={ paymentMethodType } />{ ' ' }
					{ purchase.payment_details }
				</>
			);
		}

		if ( purchase.payment_type === 'paypal' ) {
			return <PaymentMethodImage paymentMethodType={ purchase.payment_type } />;
		}

		if ( purchase.payment_type === 'upi' ) {
			return <PaymentMethodImage paymentMethodType={ purchase.payment_type } />;
		}

		return null;
	}
}
