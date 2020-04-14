/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useTranslate, TranslateResult } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { useLocalizedMoment } from 'components/localized-moment';
import { PARTNER_PAYPAL_EXPRESS } from 'lib/checkout/payment-methods';

/**
 * Style dependencies
 */
import './stored-card.scss';

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

const getCreditCardImageURL = ( type: string, selected?: boolean ): string => {
	const paths = selected ? CREDIT_CARD_SELECTED_PATHS : CREDIT_CARD_DISABLED_PATHS;
	const imagePath: string = paths[ type ] || CREDIT_CARD_DEFAULT_PATH;
	return `url(${ imagePath })`;
};

const getCreditCardSummary = ( {
	translate,
	type,
	digits,
	email,
}: {
	translate: ReturnType< typeof useTranslate >;
	type: string;
	digits?: Props[ 'lastDigits' ];
	email?: Props[ 'email' ];
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

interface Props {
	lastDigits?: string;
	cardType: string;
	name: string;
	expiry?: string;
	email?: string;
	paymentPartner: string;
	selected?: boolean;
}

const StoredCard: FunctionComponent< Props > = ( {
	cardType,
	expiry,
	lastDigits,
	name,
	selected,
	email,
	paymentPartner,
} ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	// The use of `MM/YY` should not be localized as it is an ISO standard across credit card forms: https://en.wikipedia.org/wiki/ISO/IEC_7813
	const expirationDate = expiry ? moment( expiry, moment.ISO_8601, true ) : null;
	const displayExpirationDate =
		expirationDate && expirationDate.isValid() ? expirationDate.format( 'MM/YY' ) : null;

	const type = cardType && cardType.toLocaleLowerCase();
	const typeStyle = { backgroundImage: getCreditCardImageURL( type || paymentPartner, selected ) };

	return (
		<div className="credit-card__stored-card" style={ typeStyle }>
			<span className="credit-card__stored-card-number">
				{ getCreditCardSummary( {
					translate,
					type: type || paymentPartner,
					digits: lastDigits,
					email,
				} ) }
			</span>
			<span className="credit-card__stored-card-name">{ name }</span>
			<span className="credit-card__stored-card-expiration-date">
				{ displayExpirationDate &&
					translate( 'Expires %(date)s', {
						args: { date: displayExpirationDate },
						context: 'date is of the form MM/YY',
					} ) }
			</span>
		</div>
	);
};

export default StoredCard;
