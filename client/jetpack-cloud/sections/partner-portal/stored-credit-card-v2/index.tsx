import { PaymentLogo } from '@automattic/wpcom-checkout';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import CreditCardActions from './credit-card-actions';
import type { PaymentMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods';

import './style.scss';

export default function StoredCreditCardV2( {
	creditCard,
	showSecondaryCardCount = false,
	secondaryCardCount = 0,
}: {
	creditCard: PaymentMethod;
	showSecondaryCardCount?: boolean;
	secondaryCardCount?: number;
} ) {
	const translate = useTranslate();

	const cardBrand = creditCard?.card.brand;
	const expiryMonth = creditCard?.card.exp_month;
	const expiryYear = creditCard?.card.exp_year.toString().slice( -2 ); // Take the last two digits of the year.

	const isDefault = creditCard?.is_default;

	const secondaryCardCountText = showSecondaryCardCount
		? translate( 'Secondary Card %(secondaryCardCount)d', {
				args: { secondaryCardCount },
		  } )
		: translate( 'Secondary Card' );

	const cardActions = [
		{
			name: translate( 'Set as primary card' ),
			isEnabled: ! isDefault,
			onClick: () => {},
		},
		{
			name: translate( 'Delete' ),
			isEnabled: true,
			onClick: () => {},
			className: 'stored-credit-card-v2__card-footer-actions-delete',
		},
	];

	return (
		<div className="stored-credit-card-v2__card">
			<div className="stored-credit-card-v2__card-content">
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
			<div className="stored-credit-card-v2__card-footer">
				<span>
					<div className="stored-credit-card-v2__card-footer-title">
						{ isDefault ? translate( 'Primary Card' ) : secondaryCardCountText }
					</div>
					<div className="stored-credit-card-v2__card-footer-subtitle">
						{ isDefault
							? translate( 'This card is charged automatically each month.' )
							: translate( 'This card is charged only if the primary one fails.' ) }
					</div>
				</span>
				<span>
					<CreditCardActions cardActions={ cardActions } />
				</span>
			</div>
			<div
				className={ classNames(
					'stored-credit-card-v2__payment-logo',
					`stored-credit-card-v2__payment-logo-${ cardBrand }`
				) }
			>
				<PaymentLogo brand={ cardBrand } isSummary={ true } />
			</div>
		</div>
	);
}
