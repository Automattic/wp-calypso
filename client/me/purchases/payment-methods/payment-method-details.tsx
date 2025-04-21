import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import {
	getPaymentMethodImageURL,
	PaymentMethodSummary,
} from 'calypso/lib/checkout/payment-methods';

import 'calypso/me/purchases/payment-methods/style.scss';

interface Props {
	lastDigits?: string;
	displayBrand?: string | null;
	cardType?: string;
	name: string;
	expiry?: string;
	email?: string;
	paymentPartner?: string;
	selected?: boolean;
	isExpired?: boolean;
	razorpayVpa?: string;
}

const PaymentMethodDetails: FunctionComponent< Props > = ( {
	lastDigits,
	displayBrand,
	cardType,
	name,
	expiry,
	email,
	paymentPartner,
	isExpired,
	razorpayVpa,
} ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	// The use of `MM/YY` should not be localized as it is an ISO standard across credit card forms: https://en.wikipedia.org/wiki/ISO/IEC_7813
	const expirationDate = expiry ? moment( expiry, moment.ISO_8601, true ) : null;
	const displayExpirationDate = expirationDate?.isValid() ? expirationDate.format( 'MM/YY' ) : null;

	const type = displayBrand ?? ( cardType?.toLocaleLowerCase() || paymentPartner || '' );

	return (
		<div className="payment-method-details">
			<img
				src={ getPaymentMethodImageURL( type ) }
				className="payment-method-details__image"
				alt=""
			/>
			<div className="payment-method-details__details">
				{ razorpayVpa && <span className="payment-method-details__vpa">{ razorpayVpa }</span> }
				<span className="payment-method-details__name">{ name }</span>
				<span className="payment-method-details__number">
					<PaymentMethodSummary type={ type } digits={ lastDigits } email={ email } />
				</span>

				{ displayExpirationDate && (
					<span className="payment-method-details__expiration-date">
						{ translate( 'Expires %(date)s', {
							args: { date: displayExpirationDate },
							context: 'date is of the form MM/YY',
						} ) }
					</span>
				) }

				{ isExpired && (
					<span
						className={ clsx( 'payment-method-details__expiration-notice', {
							'is-expired': isExpired,
						} ) }
					>
						<Gridicon icon="info-outline" size={ 18 } />
						{ translate( 'Credit card expired' ) }
					</span>
				) }
			</div>
		</div>
	);
};

export default PaymentMethodDetails;
