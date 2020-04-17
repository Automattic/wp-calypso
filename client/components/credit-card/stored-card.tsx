/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { useLocalizedMoment } from 'components/localized-moment';
import { getPaymentMethodImageURL, getPaymentMethodSummary } from 'lib/checkout/payment-methods';

/**
 * Style dependencies
 */
import './stored-card.scss';

interface Props {
	lastDigits?: string;
	cardType: string;
	name: string;
	expiry?: string;
	email?: string;
	paymentPartner?: string;
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
	const displayExpirationDate = expirationDate?.isValid() ? expirationDate.format( 'MM/YY' ) : null;

	const type = cardType?.toLocaleLowerCase() || paymentPartner || '';
	const typeStyle = {
		backgroundImage: getPaymentMethodImageURL( type, selected ),
	};

	return (
		<div className="credit-card__stored-card" style={ typeStyle }>
			<span className="credit-card__stored-card-number">
				{ getPaymentMethodSummary( {
					translate,
					type,
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
