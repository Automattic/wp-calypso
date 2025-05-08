import { PaymentLogo } from '@automattic/wpcom-checkout';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useContext } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { hasAgencyCapability } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { A4AStore } from 'calypso/state/a8c-for-agencies/types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { PaymentMethodOverviewContext } from '../../context';
import { useDeleteCard } from '../../hooks/use-delete-card';
import { useSetAsPrimaryCard } from '../../hooks/use-set-as-primary-card';
import useStoredCards from '../../hooks/use-stored-cards';
import StoredCreditCardDeleteDialog from '../stored-credit-card-delete-dialog';
import CreditCardActions from './credit-card-actions';
import type { PaymentMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods';

import './style.scss';

export default function StoredCreditCard( {
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

	const { isSetAsPrimaryCardPending, setAsPrimaryCard } = useSetAsPrimaryCard();

	const { paging } = useContext( PaymentMethodOverviewContext );

	const canRemove = useSelector( ( state: A4AStore ) =>
		hasAgencyCapability( state, 'a4a_remove_payment_methods' )
	);

	// Fetch the stored cards from the cache if they are available.
	const {
		data: { allStoredCards },
	} = useStoredCards( paging, true );

	const { isDeleteDialogVisible, setIsDeleteDialogVisible, handleDelete, isDeleteInProgress } =
		useDeleteCard( creditCard, allStoredCards );

	const dispatch = useDispatch();
	const cardActions = [
		{
			name: translate( 'Set as primary card' ),
			isEnabled: ! isDefault,
			onClick: () => {
				setAsPrimaryCard( {
					paymentMethodId: creditCard.id,
					useAsPrimaryPaymentMethod: true,
				} );
				dispatch( recordTracksEvent( 'calypso_a4a_payments_card_actions_set_as_primary_click' ) );
			},
		},
		{
			name: translate( 'Delete' ),
			isEnabled: canRemove,
			onClick: () => {
				setIsDeleteDialogVisible( true );
				dispatch( recordTracksEvent( 'calypso_a4a_payments_card_actions_delete_click' ) );
			},
			className: 'stored-credit-card__card-footer-actions-delete',
		},
	];

	const isLoading = isSetAsPrimaryCardPending || isDeleteInProgress;

	return (
		<>
			<div
				className={ clsx( 'stored-credit-card__card', {
					'is-loading': isLoading,
				} ) }
			>
				<div className="stored-credit-card__card-content">
					<div className="stored-credit-card__card-number">
						**** **** **** { creditCard.card.last4 }
					</div>
					<div className="stored-credit-card__card-details">
						<span>
							<div className="stored-credit-card__card-info-heading">
								{ translate( 'Card Holder name' ) }
							</div>
							<div className="stored-credit-card__card-info-value"> { creditCard?.name }</div>
						</span>
						<span>
							<div className="stored-credit-card__card-info-heading">
								{ translate( 'Expiry Date' ) }
							</div>
							<div className="stored-credit-card__card-info-value">{ `${ expiryMonth }/${ expiryYear }` }</div>
						</span>
					</div>
				</div>
				<div className="stored-credit-card__card-footer">
					<span>
						<div className="stored-credit-card__card-footer-title">
							{ isDefault ? translate( 'Primary card' ) : secondaryCardCountText }
						</div>
						<div className="stored-credit-card__card-footer-subtitle">
							{ isDefault
								? translate( 'This card is charged automatically each month.' )
								: translate( 'This card is charged only if the primary one fails.' ) }
						</div>
					</span>
					<span>
						<CreditCardActions cardActions={ cardActions } isDisabled={ isLoading } />
					</span>
				</div>
				<div
					className={ clsx(
						'stored-credit-card__payment-logo',
						`stored-credit-card__payment-logo-${ cardBrand }`
					) }
				>
					<PaymentLogo brand={ cardBrand } isSummary />
				</div>
			</div>

			{ isDeleteDialogVisible && (
				<StoredCreditCardDeleteDialog
					paymentMethod={ creditCard }
					isVisible
					onClose={ () => setIsDeleteDialogVisible( false ) }
					onConfirm={ handleDelete }
					isDeleteInProgress={ isDeleteInProgress }
				/>
			) }
		</>
	);
}
