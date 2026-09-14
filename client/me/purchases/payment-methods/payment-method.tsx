import { CompactCard } from '@automattic/components';
import {
	getPaymentMethodImageURL,
	isCreditCard,
	isRetiredPaymentMethod,
} from '@automattic/wpcom-checkout';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import PaymentMethodBackupToggle from 'calypso/me/purchases/payment-methods/payment-method-backup-toggle';
import PaymentMethodDelete from 'calypso/me/purchases/payment-methods/payment-method-delete';
import { TaxInfoArea } from 'calypso/my-sites/checkout/src/components/payment-method-tax-info';
import PaymentMethodDetails from './payment-method-details';
import type { RetiredStoredPaymentMethod, StoredPaymentMethod } from '@automattic/wpcom-checkout';

import 'calypso/me/purchases/payment-methods/style.scss';

export default function PaymentMethod( { paymentMethod }: { paymentMethod: StoredPaymentMethod } ) {
	return (
		<CompactCard
			className={ clsx( 'payment-method__wrapper', {
				'payment-method__wrapper--jetpack-cloud': isJetpackCloud(),
			} ) }
		>
			<div className="payment-method">
				{ isRetiredPaymentMethod( paymentMethod ) ? (
					<RetiredPaymentMethodDetails paymentMethod={ paymentMethod } />
				) : (
					<PaymentMethodDetails
						lastDigits={ 'card_last_4' in paymentMethod ? paymentMethod.card_last_4 : undefined }
						email={ paymentMethod.email }
						displayBrand={
							'display_brand' in paymentMethod ? paymentMethod.display_brand : undefined
						}
						cardType={ 'card_type' in paymentMethod ? paymentMethod.card_type : undefined }
						paymentPartner={ paymentMethod.payment_partner }
						name={ paymentMethod.name }
						expiry={ paymentMethod.expiry }
						isExpired={ paymentMethod.is_expired }
						razorpayVpa={ 'razorpay_vpa' in paymentMethod ? paymentMethod.razorpay_vpa : undefined }
					/>
				) }
				{ isCreditCard( paymentMethod ) && <PaymentMethodBackupToggle card={ paymentMethod } /> }
				{ ! isRetiredPaymentMethod( paymentMethod ) && (
					<TaxInfoArea
						last4={ 'card_last_4' in paymentMethod ? paymentMethod.card_last_4 : undefined }
						brand={ 'card_type' in paymentMethod ? paymentMethod.card_type : undefined }
						storedDetailsId={ paymentMethod.stored_details_id }
						paymentPartnerProcessorId={ paymentMethod.payment_partner }
					/>
				) }
				<PaymentMethodDelete card={ paymentMethod } />
			</div>
		</CompactCard>
	);
}

function RetiredPaymentMethodDetails( {
	paymentMethod,
}: {
	paymentMethod: RetiredStoredPaymentMethod;
} ) {
	const translate = useTranslate();
	const { display_label: label, display_detail: detail } = paymentMethod;
	return (
		<div className="payment-method-details">
			<img
				src={ getPaymentMethodImageURL( paymentMethod.payment_partner ) }
				className="payment-method-details__image"
				alt=""
			/>
			<div className="payment-method-details__details">
				<span className="payment-method-details__name">
					{ label || paymentMethod.name || translate( 'Saved payment method' ) }
				</span>
				{ detail && <span className="payment-method-details__number">{ detail }</span> }
			</div>
		</div>
	);
}
