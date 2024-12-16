import { TranslateResult, useTranslate } from 'i18n-calypso';
import creditCardAmexImage from 'calypso/assets/images/upgrades/cc-amex.svg';
import creditCardCartesBancairesImage from 'calypso/assets/images/upgrades/cc-cb.svg';
import creditCardDinersImage from 'calypso/assets/images/upgrades/cc-diners.svg';
import creditCardDiscoverImage from 'calypso/assets/images/upgrades/cc-discover.svg';
import creditCardJCBImage from 'calypso/assets/images/upgrades/cc-jcb.svg';
import creditCardMasterCardImage from 'calypso/assets/images/upgrades/cc-mastercard.svg';
import creditCardPlaceholderImage from 'calypso/assets/images/upgrades/cc-placeholder.svg';
import creditCardUnionPayImage from 'calypso/assets/images/upgrades/cc-unionpay.svg';
import creditCardVisaImage from 'calypso/assets/images/upgrades/cc-visa.svg';
import payPalImage from 'calypso/assets/images/upgrades/paypal.svg';
import razorpayImage from 'calypso/assets/images/upgrades/upi.svg';

export const PARTNER_PAYPAL_EXPRESS = 'paypal_express';
export const PARTNER_PAYPAL_PPCP = 'paypal_ppcp';
export const PARTNER_RAZORPAY = 'razorpay';
export const PAYMENT_AGREEMENTS_PARTNERS = [
	PARTNER_PAYPAL_EXPRESS,
	PARTNER_PAYPAL_PPCP,
	PARTNER_RAZORPAY,
];
export const UPI_PARTNERS = [ PARTNER_RAZORPAY ];

/**
 * A saved payment method (card, PayPal agreement, or Razorpay emandate).
 *
 * Used by the `/me/payment-methods` endpoint after version 1.1.
 */
export type StoredPaymentMethod =
	| StoredPaymentMethodBase
	| StoredPaymentMethodPayPal
	| StoredPaymentMethodRazorpay
	| StoredPaymentMethodCard
	| StoredPaymentMethodEbanx
	| StoredPaymentMethodStripeSource;

export interface StoredPaymentMethodBase {
	stored_details_id: string;
	user_id: string;
	name: string;
	country_code: string;
	payment_partner: string;
	payment_partner_reference: string;
	payment_partner_source_id: string;
	mp_ref: string;
	email: string;
	card_expiry_year: string | null;
	card_expiry_month: string | null;
	expiry: string;
	remember: boolean;
	source: string | null;
	original_stored_details_id: string;
	is_rechargable: boolean;
	payment_type: string;
	is_expired: boolean;
	is_backup: boolean;
	tax_location: StoredPaymentMethodTaxLocation | null;
}

export interface StoredPaymentMethodPayPal extends StoredPaymentMethodBase {
	payment_partner: 'paypal_express' | 'paypal_ppcp';
}

export interface StoredPaymentMethodRazorpay extends StoredPaymentMethodBase {
	payment_partner: 'razorpay';
}

export interface StoredPaymentMethodCard extends StoredPaymentMethodBase {
	card_type: string;
	card_iin: string;
	card_last_4: string;
	card_zip: string;
	display_brand: string | null;
}

export interface StoredPaymentMethodEbanx extends StoredPaymentMethodBase {
	address: string;
	street_number: string;
	city: string;
	state: string;
	document: string;
	phone_number: string;
	device_id: string;
}

export interface StoredPaymentMethodStripeSource extends StoredPaymentMethodBase {
	verified_name: string;
	iban_last4: string;
	bank: string;
	bic: string;
}

export interface StoredPaymentMethodRazorpay extends StoredPaymentMethodBase {
	payment_partner: 'razorpay';
	razorpay_vpa: string;
}

export interface StoredPaymentMethodTaxLocation {
	country_code?: string;
	postal_code?: string;
	subdivision_code?: string;
	ip_address?: string;
	vat_id?: string;
	organization?: string;
	address?: string;
	city?: string;
}

export const isPaymentAgreement = (
	method: StoredPaymentMethod
): method is StoredPaymentMethodPayPal =>
	PAYMENT_AGREEMENTS_PARTNERS.includes( method.payment_partner );

export const isUpiMethod = ( method: StoredPaymentMethod ): method is StoredPaymentMethodRazorpay =>
	UPI_PARTNERS.includes( method.payment_partner );

export const isCreditCard = ( method: StoredPaymentMethod ): method is StoredPaymentMethodCard =>
	! isPaymentAgreement( method ) && ! isUpiMethod( method );

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
