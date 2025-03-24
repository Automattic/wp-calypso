import { CompactCard } from '@automattic/components';
import clsx from 'clsx';
import { isCreditCard, getPaymentMethodImageURL } from 'calypso/lib/checkout/payment-methods';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import PaymentMethodBackupToggle from 'calypso/me/purchases/payment-methods/payment-method-backup-toggle';
import PaymentMethodDelete from 'calypso/me/purchases/payment-methods/payment-method-delete';
import BusinessCardBadge from 'calypso/my-sites/checkout/src/components/business-card-badge';
import { TaxInfoArea } from 'calypso/my-sites/checkout/src/components/payment-method-tax-info';
import PaymentMethodDetails from './payment-method-details';
import type { StoredPaymentMethod } from 'calypso/lib/checkout/payment-methods';
import 'calypso/me/purchases/payment-methods/style.scss';

export default function PaymentMethod( { paymentMethod }: { paymentMethod: StoredPaymentMethod } ) {
	const cardType = 'card_type' in paymentMethod ? paymentMethod.card_type : undefined;
	const displayBrand = 'display_brand' in paymentMethod ? paymentMethod.display_brand : undefined;
	const paymentPartner = paymentMethod.payment_partner;
	const type = displayBrand ?? ( cardType?.toLocaleLowerCase() || paymentPartner || '' );
	const isForBusiness = paymentMethod.tax_location?.is_for_business;
	return (
		<CompactCard
			className={ clsx( 'payment-method__wrapper', {
				'payment-method__wrapper--jetpack-cloud': isJetpackCloud(),
			} ) }
		>
			<div className="payment-method">
				<div className="payment-method-card">
					<img
						src={ getPaymentMethodImageURL( type ) }
						className="payment-method-details__image"
						alt=""
					/>
					{ isForBusiness && <BusinessCardBadge /> }
				</div>
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
					isForBusiness={ paymentMethod.tax_location?.is_for_business }
					razorpayVpa={ 'razorpay_vpa' in paymentMethod ? paymentMethod.razorpay_vpa : undefined }
				/>
				{ isCreditCard( paymentMethod ) && <PaymentMethodBackupToggle card={ paymentMethod } /> }
				<TaxInfoArea
					last4={ 'card_last_4' in paymentMethod ? paymentMethod.card_last_4 : undefined }
					brand={ 'card_type' in paymentMethod ? paymentMethod.card_type : undefined }
					storedDetailsId={ paymentMethod.stored_details_id }
					paymentPartnerProcessorId={ paymentMethod.payment_partner }
				/>
				<PaymentMethodDelete card={ paymentMethod } />
			</div>
		</CompactCard>
	);
}
