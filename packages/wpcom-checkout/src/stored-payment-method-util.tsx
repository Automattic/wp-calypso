import { isRetiredPaymentMethod } from '@automattic/api-core';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import creditCardAmexImage from './images/cc-amex.svg';
import creditCardCartesBancairesImage from './images/cc-cb.svg';
import creditCardDinersImage from './images/cc-diners.svg';
import creditCardDiscoverImage from './images/cc-discover.svg';
import creditCardJCBImage from './images/cc-jcb.svg';
import creditCardMasterCardImage from './images/cc-mastercard.svg';
import creditCardPlaceholderImage from './images/cc-placeholder.svg';
import creditCardUnionPayImage from './images/cc-unionpay.svg';
import creditCardVisaImage from './images/cc-visa.svg';
import payPalImage from './images/paypal.svg';
import razorpayImage from './images/upi.svg';
import type {
	StoredPaymentMethod,
	StoredPaymentMethodPayPal,
	StoredPaymentMethodRazorpay,
	StoredPaymentMethodCard,
} from '@automattic/api-core';

export {
	creditCardAmexImage,
	creditCardCartesBancairesImage,
	creditCardDinersImage,
	creditCardDiscoverImage,
	creditCardJCBImage,
	creditCardMasterCardImage,
	creditCardPlaceholderImage,
	creditCardUnionPayImage,
	creditCardVisaImage,
	payPalImage,
	razorpayImage,
};

export const PARTNER_PAYPAL_EXPRESS = 'paypal_express';
export const PARTNER_PAYPAL_PPCP = 'paypal_ppcp';
export const PARTNER_RAZORPAY = 'razorpay';
export const PAYMENT_AGREEMENTS_PARTNERS = [
	PARTNER_PAYPAL_EXPRESS,
	PARTNER_PAYPAL_PPCP,
	PARTNER_RAZORPAY,
];
export const UPI_PARTNERS = [ PARTNER_RAZORPAY ];

export type {
	StoredPaymentMethod,
	StoredPaymentMethodBase,
	StoredPaymentMethodPayPal,
	StoredPaymentMethodRazorpay,
	StoredPaymentMethodCard,
	StoredPaymentMethodEbanx,
	StoredPaymentMethodStripeSource,
	RetiredStoredPaymentMethod,
	StoredPaymentMethodTaxLocation,
} from '@automattic/api-core';
export { isRetiredPaymentMethod };

export const isPaymentAgreement = (
	method: StoredPaymentMethod
): method is StoredPaymentMethodPayPal =>
	PAYMENT_AGREEMENTS_PARTNERS.includes( method.payment_partner );

export const isUpiMethod = ( method: StoredPaymentMethod ): method is StoredPaymentMethodRazorpay =>
	UPI_PARTNERS.includes( method.payment_partner );

export const isCreditCard = ( method: StoredPaymentMethod ): method is StoredPaymentMethodCard =>
	! isRetiredPaymentMethod( method ) && ! isPaymentAgreement( method ) && ! isUpiMethod( method );

interface ImagePathsMap {
	[ key: string ]: string;
}

const CREDIT_CARD_SELECTED_PATHS: ImagePathsMap = {
	amex: creditCardAmexImage,
	cartes_bancaires: creditCardCartesBancairesImage,
	diners: creditCardDinersImage,
	discover: creditCardDiscoverImage,
	jcb: creditCardJCBImage,
	mastercard: creditCardMasterCardImage,
	unionpay: creditCardUnionPayImage,
	visa: creditCardVisaImage,
	paypal: payPalImage,
	paypal_express: payPalImage,
	paypal_ppcp: payPalImage,
	razorpay: razorpayImage,
};

const CREDIT_CARD_DEFAULT_PATH = creditCardPlaceholderImage;

export const getPaymentMethodImageURL = ( type: string ): string => {
	const paths = CREDIT_CARD_SELECTED_PATHS;
	const imagePath: string = paths[ type ] || CREDIT_CARD_DEFAULT_PATH;
	return `${ imagePath }`;
};

export const PaymentMethodSummary = ( {
	type,
	digits,
	email,
}: {
	type: string;
	digits?: string;
	email?: string;
} ) => {
	const translate = useTranslate();
	if ( type === PARTNER_PAYPAL_EXPRESS || type === PARTNER_PAYPAL_PPCP ) {
		return <>{ email || '' }</>;
	}
	if ( type === PARTNER_RAZORPAY ) {
		return <>{ translate( 'Unified Payments Interface (UPI)' ) }</>;
	}
	let displayType: TranslateResult;
	switch ( type && type.toLocaleLowerCase() ) {
		case 'american express':
		case 'amex':
			displayType = translate( 'American Express' );
			break;

		case 'cartes_bancaires':
			displayType = translate( 'Cartes Bancaires' );
			break;

		case 'diners':
			displayType = translate( 'Diners Club' );
			break;

		case 'discover':
			displayType = translate( 'Discover', {
				context: 'Name of credit card',
			} );
			break;

		case 'jcb':
			displayType = translate( 'JCB' );
			break;

		case 'mastercard':
			displayType = translate( 'Mastercard' );
			break;

		case 'unionpay':
			displayType = translate( 'UnionPay' );
			break;

		case 'visa':
			displayType = translate( 'VISA' );
			break;

		default:
			displayType = type;
	}

	if ( ! digits ) {
		return <>{ displayType }</>;
	}

	return (
		<>
			{ translate( '%(displayType)s ****%(digits)s', {
				args: { displayType, digits },
			} ) }
		</>
	);
};
