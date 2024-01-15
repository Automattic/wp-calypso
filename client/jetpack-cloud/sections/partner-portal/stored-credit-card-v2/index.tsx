import { PaymentLogo } from '@automattic/wpcom-checkout';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import type { PaymentMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods';

import './style.scss';

export default function StoredCreditCardV2( { creditCard }: { creditCard: PaymentMethod } ) {
	const translate = useTranslate();

	const cardBrand = creditCard?.card.brand;
	const expiryMonth = creditCard?.card.exp_month;
	const expiryYear = creditCard?.card.exp_year.toString().slice( -2 ); // Take the last two digits of the year.

	return (
		<div className="stored-credit-card-v2__card">
			<div
				className={ classNames(
					'stored-credit-card-v2__payment-logo',
					`stored-credit-card-v2__payment-logo-${ cardBrand }`
				) }
			>
				<PaymentLogo brand={ cardBrand } isSummary={ true } />
			</div>
			<div className="stored-credit-card-v2__card-number">
				**** **** **** { creditCard.card.last4 }
			</div>
			<div className="stored-credit-card-v2__card-details">
				<span>
					<div className="stored-credit-card-v2__card-info-heading">
						{ translate( 'Card Holder name' ) }
					</div>
					<div className="stored-credit-card-v2__card-info-value"> { creditCard?.name }</div>
				</span>
				<span>
					<div className="stored-credit-card-v2__card-info-heading">
						{ translate( 'Expiry Date' ) }
					</div>
					<div className="stored-credit-card-v2__card-info-value">{ `${ expiryMonth }/${ expiryYear }` }</div>
				</span>
			</div>
		</div>
	);
}
