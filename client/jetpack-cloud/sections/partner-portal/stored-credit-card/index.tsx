import { PaymentLogo } from '@automattic/wpcom-checkout';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import PaymentMethodActions from 'calypso/jetpack-cloud/sections/partner-portal/payment-method-actions';
import { useSelector } from 'calypso/state';
import { isDeletingStoredCard } from 'calypso/state/partner-portal/stored-cards/selectors';
import type { PaymentMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods';

import './style.scss';

export default function StoredCreditCard( props: { card: PaymentMethod } ) {
	const translate = useTranslate();
	const creditCard = props.card;

	const expiryMonth = creditCard?.card.exp_month;
	const expiryYear = creditCard?.card.exp_year;

	const isDeleting = useSelector( ( state ) => isDeletingStoredCard( state, creditCard.id ) );

	return (
		<div
			className={ clsx( 'stored-credit-card', {
				'delete-in-progress': isDeleting,
			} ) }
		>
			<div className="stored-credit-card__header">
				<div className="stored-credit-card__labels">
					<div className="stored-credit-card__payment-logo">
						<PaymentLogo brand={ creditCard?.card.brand } isSummary />
					</div>
					{ creditCard?.is_default && (
						<div className="stored-credit-card__primary">{ translate( 'Primary' ) }</div>
					) }
				</div>

				<div className="stored-credit-card__actions">
					<div className="stored-credit-card__actions">
						{ isDeleting ? (
							<span>{ translate( 'Removing card' ) }</span>
						) : (
							<PaymentMethodActions card={ creditCard } />
						) }
					</div>
				</div>
			</div>
			<div className="stored-credit-card__footer">
				<div className="stored-credit-card__footer-left">
					<div className="stored-credit-card__name">{ creditCard?.name }</div>
					<div className="stored-credit-card__number">
						**** **** **** { creditCard?.card.last4 }
					</div>
				</div>

				<div className="stored-credit-card__footer-right">
					<div className="stored-credit-card__expiry">{ `${ expiryMonth }/${ expiryYear }` }</div>
				</div>
			</div>
		</div>
	);
}
