import { CompactCard } from '@automattic/components';
import classNames from 'classnames';
import { isCreditCard } from 'calypso/lib/checkout/payment-methods';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import PaymentMethodBackupToggle from 'calypso/me/purchases/payment-methods/payment-method-backup-toggle';
import PaymentMethodDelete from 'calypso/me/purchases/payment-methods/payment-method-delete';
import { TaxInfoArea } from 'calypso/my-sites/checkout/composite-checkout/components/payment-method-tax-info';
import PaymentMethodDetails from './payment-method-details';
import type { PaymentMethod as PaymentMethodType } from 'calypso/lib/checkout/payment-methods';

import 'calypso/me/purchases/payment-methods/style.scss';

export default function PaymentMethod( { paymentMethod }: { paymentMethod: PaymentMethodType } ) {
	return (
		<CompactCard
			className={ classNames( 'payment-method__wrapper', {
				'payment-method__wrapper--jetpack-cloud': isJetpackCloud(),
			} ) }
		>
			<div className="payment-method">
				<PaymentMethodDetails
					lastDigits={ paymentMethod.card }
					email={ paymentMethod.email }
					cardType={ paymentMethod.card_type || '' }
					paymentPartner={ paymentMethod.payment_partner }
					name={ paymentMethod.name }
					expiry={ paymentMethod.expiry }
					isExpired={ paymentMethod.is_expired }
				/>
				{ isCreditCard( paymentMethod ) && <PaymentMethodBackupToggle card={ paymentMethod } /> }
				<TaxInfoArea
					last4={ paymentMethod.card }
					brand={ paymentMethod.card_type }
					storedDetailsId={ paymentMethod.stored_details_id }
					paymentPartnerProcessorId={ paymentMethod.payment_partner }
				/>
				<PaymentMethodDelete card={ paymentMethod } />
			</div>
		</CompactCard>
	);
}
