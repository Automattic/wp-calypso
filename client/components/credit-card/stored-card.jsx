/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { flowRight as compose } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { withLocalizedMoment } from 'components/localized-moment';

/**
 * Style dependencies
 */
import './stored-card.scss';

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

const StoredCard = ( { lastDigits, cardType, name, expiry, translate, moment } ) => {
	// The use of `MM/YY` should not be localized as it is an ISO standard across credit card forms: https://en.wikipedia.org/wiki/ISO/IEC_7813
	const expirationDate = moment( expiry ).format( 'MM/YY' );

	const type = cardType && cardType.toLocaleLowerCase();
	const cardClasses = classNames( 'credit-card__stored-card', {
		'is-amex': type === 'amex' || type === 'american express',
		'is-diners': type === 'diners',
		'is-discover': type === 'discover',
		'is-jcb': type === 'jcb',
		'is-mastercard': type === 'mastercard',
		'is-unionpay': type === 'unionpay',
		'is-visa': type === 'visa',
	} );

	return (
		<div className={ cardClasses }>
			<span className="credit-card__stored-card-number">
				{ getCreditCardSummary( translate, cardType, lastDigits ) }
			</span>
			<span className="credit-card__stored-card-name">{ name }</span>
			<span className="credit-card__stored-card-expiration-date">
				{ translate( 'Expires %(date)s', {
					args: { date: expirationDate },
					context: 'date is of the form MM/YY',
				} ) }
			</span>
		</div>
	);
};

StoredCard.propTypes = {
	lastDigits: PropTypes.string.isRequired,
	cardType: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	expiry: PropTypes.string.isRequired,
};

export default compose(
	localize,
	withLocalizedMoment
)( StoredCard );
