/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import {
	getPaymentMethodImageURL,
	getPaymentMethodSummary,
} from 'calypso/lib/checkout/payment-methods';

/**
 * Style dependencies
 */
import 'calypso/me/purchases/payment-methods/style.scss';

interface Props {
	lastDigits?: string;
	cardType: string;
	name: string;
	expiry?: string;
	email?: string;
	paymentPartner?: string;
	selected?: boolean;
}

const PaymentMethodDetails: FunctionComponent< Props > = ( {
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

	return (
		<>
			<img
				src={ getPaymentMethodImageURL( type, selected ) }
				className="payment-method-details__image"
				alt=""
			/>
			<div className="payment-method-details__details">
				<span className="payment-method-details__number">
					{ getPaymentMethodSummary( {
						translate,
						type,
						digits: lastDigits,
						email,
					} ) }
				</span>

				{ displayExpirationDate && (
					<span className="payment-method-details__expiration-date">
						{ translate( 'Expires %(date)s', {
							args: { date: displayExpirationDate },
							context: 'date is of the form MM/YY',
						} ) }
					</span>
				) }
				<span className="payment-method-details__name">{ name }</span>
			</div>
		</>
	);
};

export default PaymentMethodDetails;
