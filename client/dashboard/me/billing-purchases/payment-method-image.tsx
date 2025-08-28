import creditCardAmexImage from './images/cc-amex.svg';
import creditCardCartesBancairesImage from './images/cc-cb.svg';
import creditCardDinersImage from './images/cc-diners.svg';
import creditCardDiscoverImage from './images/cc-discover.svg';
import creditCardJCBImage from './images/cc-jcb.svg';
import creditCardMastercardImage from './images/cc-mastercard.svg';
import creditCardPlaceholderImage from './images/cc-placeholder.svg';
import creditCardUnionPayImage from './images/cc-unionpay.svg';
import creditCardVisaImage from './images/cc-visa.svg';
import payPalImage from './images/paypal.svg';
import upiImage from './images/upi.svg';

export type PaymentMethodType =
	| 'amex'
	| 'cb'
	| 'diners'
	| 'discover'
	| 'jcb'
	| 'mastercard'
	| 'unionpay'
	| 'visa'
	| 'paypal'
	| 'upi';

export function getPaymentMethodImageURL( paymentMethodType: string ): string {
	switch ( paymentMethodType as PaymentMethodType ) {
		case 'amex':
			return creditCardAmexImage;
		case 'cb':
			return creditCardCartesBancairesImage;
		case 'diners':
			return creditCardDinersImage;
		case 'discover':
			return creditCardDiscoverImage;
		case 'jcb':
			return creditCardJCBImage;
		case 'mastercard':
			return creditCardMastercardImage;
		case 'unionpay':
			return creditCardUnionPayImage;
		case 'visa':
			return creditCardVisaImage;
		case 'paypal':
			return payPalImage;
		case 'upi':
			return upiImage;
		default:
			return creditCardPlaceholderImage;
	}
}

export function PaymentMethodImage( { paymentMethodType }: { paymentMethodType: string } ) {
	return (
		<img
			className="payment-method-image"
			alt={ paymentMethodType }
			src={ getPaymentMethodImageURL( paymentMethodType ) }
			width={ 30 }
			height={ 19 }
		/>
	);
}
