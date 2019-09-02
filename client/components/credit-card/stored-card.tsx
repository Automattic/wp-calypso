/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { useLocalizedMoment } from 'components/localized-moment';

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

const CREDIT_CARD_SELECTED_PATHS = {
	amex: creditCardAmexImage,
	diners: creditCardDinersImage,
	discover: creditCardDiscoverImage,
	jcb: creditCardJCBImage,
	mastercard: creditCardMasterCardImage,
	unionpay: creditCardUnionPayImage,
	visa: creditCardVisaImage,
};

const CREDIT_CARD_DISABLED_PATHS = {
	amex: creditCardAmexDisabledImage,
	diners: creditCardDinersDisabledImage,
	discover: creditCardDiscoverDisabledImage,
	jcb: creditCardJCBDisabledImage,
	mastercard: creditCardMasterCardDisabledImage,
	unionpay: creditCardUnionPayDisabledImage,
	visa: creditCardVisaDisabledImage,
};

const CREDIT_CARD_DEFAULT_PATH = creditCardPlaceholderImage;

const getCreditCardImageURL = ( type, selected ) => {
	const paths = selected ? CREDIT_CARD_SELECTED_PATHS : CREDIT_CARD_DISABLED_PATHS;
	const imagePath = paths[ type ] || CREDIT_CARD_DEFAULT_PATH;
	return `url(${ imagePath })`;
};

export const getCreditCardSummary = ( translate, type, digits ) => {
	const supportedTypes = {
		[ 'american express' ]: translate( 'American Express' ),
		amex: translate( 'American Express' ),
		diners: translate( 'Diners Club' ),
		discover: translate( 'Discover' ),
		jcb: translate( 'JCB' ),
		mastercard: translate( 'Mastercard' ),
		unionpay: translate( 'UnionPay' ),
		visa: translate( 'VISA' ),
	};

	const displayType = supportedTypes[ type && type.toLowerCase() ] || type;
	if ( ! digits ) {
		return displayType;
	}

	return translate( '%(displayType)s ****%(digits)s', {
		args: { displayType, digits },
	} );
};

const StoredCard = ( { lastDigits, cardType, name, expiry, selected } ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	// The use of `MM/YY` should not be localized as it is an ISO standard across credit card forms: https://en.wikipedia.org/wiki/ISO/IEC_7813
	const expirationDate = expiry ? moment( expiry, moment.ISO_8601, true ).format( 'MM/YY' ) : null;

	const type = cardType && cardType.toLocaleLowerCase();
	const typeStyle = { backgroundImage: getCreditCardImageURL( type, selected ) };

	return (
		<div className="credit-card__stored-card" style={ typeStyle }>
			<span className="credit-card__stored-card-number">
				{ getCreditCardSummary( translate, cardType, lastDigits ) }
			</span>
			<span className="credit-card__stored-card-name">{ name }</span>
			<span className="credit-card__stored-card-expiration-date">
				{ expirationDate &&
					translate( 'Expires %(date)s', {
						args: { date: expirationDate },
						context: 'date is of the form MM/YY',
					} ) }
			</span>
		</div>
	);
};

StoredCard.propTypes = {
	lastDigits: PropTypes.string,
	cardType: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	expiry: PropTypes.string,
	selected: PropTypes.bool,
};

export default StoredCard;
