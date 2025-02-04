import { PaymentLogo } from '@automattic/wpcom-checkout';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import PaymentMethodDeleteDialog from 'calypso/jetpack-cloud/sections/partner-portal/payment-method-delete-dialog';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import CreditCardActions from './credit-card-actions';
import { useDeleteCard } from './hooks/use-delete-card';
import { useSetAsPrimaryCard } from './hooks/use-set-as-primary-card';
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

	const { isSetAsPrimaryCardPending, setAsPrimaryCard } = useSetAsPrimaryCard();
	const {
		isDeleteDialogVisible,
		setIsDeleteDialogVisible,
		closeDialog,
		handleDelete,
		isDeleteInProgress,
	} = useDeleteCard( creditCard );

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
				dispatch(
					recordTracksEvent( 'calypso_partner_portal_payments_card_actions_set_as_primary_click' )
				);
			},
		},
		{
			name: translate( 'Delete' ),
			isEnabled: true,
			onClick: () => {
				setIsDeleteDialogVisible( true );
				dispatch(
					recordTracksEvent( 'calypso_partner_portal_payments_card_actions_delete_click' )
				);
			},
			className: 'stored-credit-card-v2__card-footer-actions-delete',
		},
	];

	const isLoading = isSetAsPrimaryCardPending || isDeleteInProgress;

	return (
		<>
			<div
				className={ clsx( 'stored-credit-card-v2__card', {
					'is-loading': isLoading,
				} ) }
			>
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
						<CreditCardActions cardActions={ cardActions } isDisabled={ isLoading } />
					</span>
				</div>
				<div
					className={ clsx(
						'stored-credit-card-v2__payment-logo',
						`stored-credit-card-v2__payment-logo-${ cardBrand }`
					) }
				>
					<PaymentLogo brand={ cardBrand } isSummary />
				</div>
			</div>
			{ isDeleteDialogVisible && (
				<PaymentMethodDeleteDialog
					paymentMethod={ creditCard }
					isVisible
					onClose={ closeDialog }
					onConfirm={ handleDelete }
				/>
			) }
		</>
	);
}
