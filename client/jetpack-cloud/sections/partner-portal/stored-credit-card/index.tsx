import { PaymentLogo } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';
import { ReactElement } from 'react';
import './style.scss';

export default function StoredCreditCard( props ): ReactElement {
	const translate = useTranslate();
	const creditCard = props.card;

	const [ year, expiryMonth ] = creditCard.expiry.split( '-' );
	const expiryYear = year.substr( 2, 2 );

	return (
		<div className="stored-credit-card">
			<div className="stored-credit-card__header">
				<div className="stored-credit-card__payment-logo">
					<PaymentLogo brand={ creditCard.card_type } isSummary={ true } />
				</div>

				<div className="stored-credit-card__primary">{ translate( 'Primary' ) }</div>
			</div>
			<div className="stored-credit-card__footer">
				<div className="stored-credit-card__footer-left">
					<div className="stored-credit-card__name">{ creditCard.name }</div>
					<div className="stored-credit-card__number">**** **** **** { creditCard.card }</div>
				</div>

				<div className="stored-credit-card__footer-right">
					<div className="stored-credit-card__expiry">{ `${ expiryMonth }/${ expiryYear }` }</div>
				</div>
			</div>
		</div>
	);
}
