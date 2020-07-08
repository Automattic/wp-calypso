/**
 * External dependencies
 */
import { TranslateResult, useTranslate } from 'i18n-calypso';

/**
 * Image assets
 */
import creditCardAmexImage from 'assets/images/upgrades/cc-amex.svg';
import creditCardAmexDisabledImage from 'assets/images/upgrades/cc-amex-disabled.svg';
import creditCardDinersImage from 'assets/images/upgrades/cc-diners.svg';
import creditCardDinersDisabledImage from 'assets/images/upgrades/cc-diners-disabled.svg';
import creditCardDiscoverImage from 'assets/images/upgrades/cc-discover.svg';
import creditCardDiscoverDisabledImage from 'assets/images/upgrades/cc-discover-disabled.svg';
import creditCardJCBImage from 'assets/images/upgrades/cc-jcb.svg';
import creditCardJCBDisabledImage from 'assets/images/upgrades/cc-jcb-disabled.svg';
import creditCardMasterCardImage from 'assets/images/upgrades/cc-mastercard.svg';
import creditCardMasterCardDisabledImage from 'assets/images/upgrades/cc-mastercard-disabled.svg';
import creditCardPlaceholderImage from 'assets/images/upgrades/cc-placeholder.svg';
import creditCardUnionPayImage from 'assets/images/upgrades/cc-unionpay.svg';
import creditCardUnionPayDisabledImage from 'assets/images/upgrades/cc-unionpay-disabled.svg';
import creditCardVisaImage from 'assets/images/upgrades/cc-visa.svg';
import creditCardVisaDisabledImage from 'assets/images/upgrades/cc-visa-disabled.svg';
import payPalDisabledImage from 'assets/images/upgrades/paypal-disabled.svg';
import payPalImage from 'assets/images/upgrades/paypal.svg';

export const PARTNER_PAYPAL_EXPRESS = 'paypal_express';
export const PAYMENT_AGREEMENTS_PARTNERS = [ PARTNER_PAYPAL_EXPRESS ];

export interface PaymentMethod {
	card?: string;
	email: string;
	card_type?: string;
	payment_partner: string;
	name: string;
	expiry: string;
	stored_details_id: string;
}

export const isPaymentAgreement = ( method: PaymentMethod ) =>
	PAYMENT_AGREEMENTS_PARTNERS.includes( method.payment_partner );

export const isCreditCard = ( method: PaymentMethod ) => ! isPaymentAgreement( method );

interface ImagePathsMap {
	[ key: string ]: string;
}

const CREDIT_CARD_SELECTED_PATHS: ImagePathsMap = {
	amex: creditCardAmexImage,
	diners: creditCardDinersImage,
	discover: creditCardDiscoverImage,
	jcb: creditCardJCBImage,
	mastercard: creditCardMasterCardImage,
	unionpay: creditCardUnionPayImage,
	visa: creditCardVisaImage,
	paypal_express: payPalImage,
	paypal: payPalImage,
};

const CREDIT_CARD_DISABLED_PATHS: ImagePathsMap = {
	amex: creditCardAmexDisabledImage,
	diners: creditCardDinersDisabledImage,
	discover: creditCardDiscoverDisabledImage,
	jcb: creditCardJCBDisabledImage,
	mastercard: creditCardMasterCardDisabledImage,
	unionpay: creditCardUnionPayDisabledImage,
	visa: creditCardVisaDisabledImage,
	paypal_express: payPalDisabledImage,
	paypal: payPalDisabledImage,
};

const CREDIT_CARD_DEFAULT_PATH = creditCardPlaceholderImage;

export const getPaymentMethodImageURL = ( type: string, selected?: boolean ): string => {
	const paths = selected ? CREDIT_CARD_SELECTED_PATHS : CREDIT_CARD_DISABLED_PATHS;
	const imagePath: string = paths[ type ] || CREDIT_CARD_DEFAULT_PATH;
	return `url(${ imagePath })`;
};

export const getPaymentMethodSummary = ( {
	translate,
	type,
	digits,
	email,
}: {
	translate: ReturnType< typeof useTranslate >;
	type: string;
	digits?: string;
	email?: string;
} ): TranslateResult => {
	if ( type === PARTNER_PAYPAL_EXPRESS ) {
		return email || '';
	}
	let displayType: TranslateResult;
	switch ( type && type.toLocaleLowerCase() ) {
		case 'american express':
		case 'amex':
			displayType = translate( 'American Express' );
			break;

		case 'diners':
			displayType = translate( 'Diners Club' );
			break;

		case 'discover':
			displayType = translate( 'Discover' );
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
		return displayType;
	}

	return translate( '%(displayType)s ****%(digits)s', {
		args: { displayType, digits },
	} );
};
